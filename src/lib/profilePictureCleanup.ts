import { supabase } from './supabaseClient';

/**
 * Extracts the file path from a Supabase storage URL
 * @param profilePictureUrl - The full URL of the profile picture
 * @returns The file path for storage operations
 */
export const extractFilePath = (profilePictureUrl: string): string => {
  try {
    const url = new URL(profilePictureUrl);
    // Remove the leading path segments to get just the filename
    return url.pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
  } catch (error) {
    // Error extracting file path from URL
    return '';
  }
};

/**
 * Deletes a profile picture from Supabase storage
 * @param profilePictureUrl - The URL of the profile picture to delete
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const deleteProfilePicture = async (profilePictureUrl: string): Promise<boolean> => {
  if (!profilePictureUrl) return true; // Nothing to delete
  
  try {
    const filePath = extractFilePath(profilePictureUrl);
    if (!filePath) {
      // Could not extract file path from profile picture URL
      return false;
    }

    // Deleting old profile picture
    
    const { error } = await supabase.storage
      .from('user-data')
      .remove([filePath]);

    if (error) {
      // Error deleting profile picture
      return false;
    }

    // Successfully deleted old profile picture
    return true;
  } catch (error) {
    // Error in deleteProfilePicture
    return false;
  }
};

/**
 * Updates a user's profile picture with automatic cleanup of the old one
 * @param userId - The user's ID
 * @param newProfilePictureUrl - The URL of the new profile picture
 * @param oldProfilePictureUrl - The URL of the old profile picture (optional)
 * @returns Promise<{success: boolean, error?: string}>
 */
export const updateProfilePicture = async (
  userId: string, 
  newProfilePictureUrl: string, 
  oldProfilePictureUrl?: string
): Promise<{success: boolean, error?: string}> => {
  try {
    // Delete old profile picture if it exists
    if (oldProfilePictureUrl) {
      const deleteSuccess = await deleteProfilePicture(oldProfilePictureUrl);
      if (!deleteSuccess) {
        // Failed to delete old profile picture, but continuing with update
      }
    }

    // Update the profile with new picture URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        profile_picture: newProfilePictureUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      // Error updating profile picture
      return { success: false, error: updateError.message };
    }

    // Successfully updated profile picture
    return { success: true };
  } catch (error: any) {
    // Error in updateProfilePicture
    return { success: false, error: error.message };
  }
};

/**
 * Removes a user's profile picture with automatic cleanup
 * @param userId - The user's ID
 * @param oldProfilePictureUrl - The URL of the profile picture to remove
 * @returns Promise<{success: boolean, error?: string}>
 */
export const removeProfilePicture = async (
  userId: string, 
  oldProfilePictureUrl?: string
): Promise<{success: boolean, error?: string}> => {
  try {
    // Delete old profile picture if it exists
    if (oldProfilePictureUrl) {
      const deleteSuccess = await deleteProfilePicture(oldProfilePictureUrl);
      if (!deleteSuccess) {
        // Failed to delete old profile picture, but continuing with removal
      }
    }

    // Update the profile to remove picture URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        profile_picture: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      // Error removing profile picture
      return { success: false, error: updateError.message };
    }

    // Successfully removed profile picture
    return { success: true };
  } catch (error: any) {
    // Error in removeProfilePicture
    return { success: false, error: error.message };
  }
};
