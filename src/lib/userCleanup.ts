/**
 * Comprehensive user cleanup utilities for Clinkr
 * 
 * This module provides functions to clean up user data, storage files, and related records
 * when a user deletes their profile. It handles both client-side and server-side cleanup.
 */

import { supabase } from './supabaseClient';

// Interface for cleanup results
export interface CleanupResult {
  success: boolean;
  message: string;
  errors?: string[];
  deletedFiles?: string[];
  deletedRecords?: {
    profiles: number;
    shortened_links: number;
    link_analytics: number;
    profile_views: number;
  };
}

// Client-side cleanup function using Edge Function (recommended)
export const cleanupUserData = async (userId: string): Promise<CleanupResult> => {
  try {
    // Get current session token for verification
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        success: false,
        message: 'No active session found',
        errors: ['User must be logged in to delete account']
      };
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('user-cleanup', {
      body: {
        userId,
        userToken: session.access_token
      }
    });

    if (error) {
      // Edge Function error
      return {
        success: false,
        message: 'Failed to call cleanup service',
        errors: [error.message]
      };
    }

    // If cleanup was successful, sign out the user and clear all auth state
    if (data.success) {
      try {
        await supabase.auth.signOut();
        
        // Clear all Supabase-related localStorage items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear any cookies (if any)
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // All auth data cleared, redirecting to homepage
        
        // Force a complete page reload to clear all state
        setTimeout(() => {
          window.location.href = '/homepage';
        }, 100);
      } catch (signOutError) {
        // Error signing out
        // Still redirect even if signout fails
        window.location.href = '/homepage';
      }
    }

    return data as CleanupResult;

  } catch (error: any) {
    // Error during user cleanup
    return {
      success: false,
      message: 'Failed to clean up user data',
      errors: [error.message]
    };
  }
};

// Fallback client-side cleanup function (for when Edge Functions are not available)
export const cleanupUserDataFallback = async (userId: string): Promise<CleanupResult> => {
  const errors: string[] = [];
  const deletedFiles: string[] = [];
  let deletedRecords = {
    profiles: 0,
    shortened_links: 0,
    link_analytics: 0,
    profile_views: 0
  };

  try {
    // 1. Get user profile to access profile picture and other data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('profile_picture, username')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      errors.push(`Failed to fetch profile: ${profileError.message}`);
    }

    // 2. Delete profile picture from storage if exists
    if (profile?.profile_picture) {
      try {
        // Extract filename from URL - handle different URL formats
        let fileName = '';
        if (profile.profile_picture.includes('/storage/v1/object/public/user-data/')) {
          fileName = new URL(profile.profile_picture).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
        } else {
          // Fallback for other URL formats
          const urlParts = profile.profile_picture.split('/');
          fileName = urlParts[urlParts.length - 1];
        }

        const { error: storageError } = await supabase.storage
          .from('user-data')
          .remove([fileName]);

        if (storageError) {
          errors.push(`Failed to delete profile picture: ${storageError.message}`);
        } else {
          deletedFiles.push(fileName);
        }
      } catch (storageErr: any) {
        errors.push(`Error deleting profile picture: ${storageErr.message}`);
      }
    }

    // 3. Delete all user-related data from database tables
    const deletePromises = [
      // Delete shortened links
      supabase.from('shortened_links').delete().eq('user_id', userId),
      // Delete analytics data
      supabase.from('link_analytics').delete().eq('user_id', userId),
      // Delete profile views
      supabase.from('profile_views').delete().eq('profile_id', userId),
      // Delete profile
      supabase.from('profiles').delete().eq('id', userId)
    ];

    // Execute all deletions
    const results = await Promise.allSettled(deletePromises);
    
    // Process results and count deleted records
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const tableNames = ['shortened_links', 'link_analytics', 'profile_views', 'profiles'];
        errors.push(`Failed to delete from ${tableNames[index]}: ${result.reason}`);
      } else if (result.status === 'fulfilled') {
        const tableNames = ['shortened_links', 'link_analytics', 'profile_views', 'profiles'];
        // Supabase delete operations don't return deleted records by default
        // We'll assume successful deletion if no error occurred
        deletedRecords[tableNames[index] as keyof typeof deletedRecords] = 1;
      }
    });

    // 4. Sign out the user and clear all auth state
    try {
      await supabase.auth.signOut();
      
      // Clear all Supabase-related localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear any cookies (if any)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // All auth data cleared, redirecting to homepage
      
      // Force a complete page reload to clear all state
      setTimeout(() => {
        window.location.href = '/homepage';
      }, 100);
    } catch (signOutError) {
      // Error signing out
      // Still redirect even if signout fails
      window.location.href = '/homepage';
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'User data cleaned up successfully' : 'User cleanup completed with some errors',
      errors: errors.length > 0 ? errors : undefined,
      deletedFiles: deletedFiles.length > 0 ? deletedFiles : undefined,
      deletedRecords
    };

  } catch (error: any) {
    // Error during user cleanup
    return {
      success: false,
      message: 'Failed to clean up user data',
      errors: [error.message]
    };
  }
};

// Server-side cleanup function (Edge Function) for complete user deletion with admin privileges
export const deleteUserCompletely = async (userId: string): Promise<CleanupResult> => {
  const { createClient } = await import('@supabase/supabase-js');
  
  // Use service role key for admin operations
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const errors: string[] = [];
  const deletedFiles: string[] = [];
  let deletedRecords = {
    profiles: 0,
    shortened_links: 0,
    link_analytics: 0,
    profile_views: 0
  };

  try {
    // 1. Get user profile to access profile picture
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('profile_picture, username')
      .eq('id', userId)
      .single();
    
    // 2. Delete profile picture from storage
    if (profile?.profile_picture) {
      try {
        let fileName = '';
        if (profile.profile_picture.includes('/storage/v1/object/public/user-data/')) {
          fileName = new URL(profile.profile_picture).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
        } else {
          const urlParts = profile.profile_picture.split('/');
          fileName = urlParts[urlParts.length - 1];
        }
        
        const { error: storageError } = await supabaseAdmin.storage
          .from('user-data')
          .remove([fileName]);

        if (storageError) {
          errors.push(`Failed to delete profile picture: ${storageError.message}`);
        } else {
          deletedFiles.push(fileName);
        }
      } catch (storageErr: any) {
        errors.push(`Error deleting profile picture: ${storageErr.message}`);
      }
    }
    
    // 3. Delete all user data
    const deleteResults = await Promise.allSettled([
      supabaseAdmin.from('shortened_links').delete().eq('user_id', userId),
      supabaseAdmin.from('link_analytics').delete().eq('user_id', userId),
      supabaseAdmin.from('profile_views').delete().eq('profile_id', userId),
      supabaseAdmin.from('profiles').delete().eq('id', userId)
    ]);

    // Process deletion results
    const tableNames = ['shortened_links', 'link_analytics', 'profile_views', 'profiles'];
    deleteResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        errors.push(`Failed to delete from ${tableNames[index]}: ${result.reason}`);
      } else if (result.status === 'fulfilled') {
        // Supabase delete operations don't return deleted records by default
        // We'll assume successful deletion if no error occurred
        deletedRecords[tableNames[index] as keyof typeof deletedRecords] = 1;
      }
    });
    
    // 4. Delete user from Auth (Admin API only)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      errors.push(`Failed to delete user from Auth: ${authError.message}`);
    }
    
    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'User completely deleted' : 'User deletion completed with some errors',
      errors: errors.length > 0 ? errors : undefined,
      deletedFiles: deletedFiles.length > 0 ? deletedFiles : undefined,
      deletedRecords
    };
  } catch (error: any) {
    // Error deleting user
    return {
      success: false,
      message: 'Failed to delete user',
      errors: [error.message]
    };
  }
};

// Utility function to find orphaned storage files
export const findOrphanedStorageFiles = async (): Promise<string[]> => {
  try {
    const { data: files, error } = await supabase.storage
      .from('user-data')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      // Error listing storage files
      return [];
    }

    if (!files || files.length === 0) {
      return [];
    }

    // Get all existing profile picture URLs
    const { data: profiles } = await supabase
      .from('profiles')
      .select('profile_picture')
      .not('profile_picture', 'is', null);

    const existingFileNames = new Set<string>();
    profiles?.forEach(profile => {
      if (profile.profile_picture) {
        let fileName = '';
        if (profile.profile_picture.includes('/storage/v1/object/public/user-data/')) {
          fileName = new URL(profile.profile_picture).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
        } else {
          const urlParts = profile.profile_picture.split('/');
          fileName = urlParts[urlParts.length - 1];
        }
        existingFileNames.add(fileName);
      }
    });

    // Find orphaned files
    const orphanedFiles = files
      .filter(file => !existingFileNames.has(file.name))
      .map(file => file.name);

    return orphanedFiles;
  } catch (error) {
    // Error finding orphaned storage files
    return [];
  }
};

// Utility function to clean up orphaned storage files
export const cleanupOrphanedStorageFiles = async (): Promise<CleanupResult> => {
  const errors: string[] = [];
  const deletedFiles: string[] = [];

  try {
    const orphanedFiles = await findOrphanedStorageFiles();
    
    if (orphanedFiles.length === 0) {
      return {
        success: true,
        message: 'No orphaned storage files found',
        deletedFiles: []
      };
    }

    // Delete orphaned files in batches
    const batchSize = 10;
    for (let i = 0; i < orphanedFiles.length; i += batchSize) {
      const batch = orphanedFiles.slice(i, i + batchSize);
      
      const { error: deleteError } = await supabase.storage
        .from('user-data')
        .remove(batch);

      if (deleteError) {
        errors.push(`Failed to delete batch ${i / batchSize + 1}: ${deleteError.message}`);
      } else {
        deletedFiles.push(...batch);
      }
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Successfully cleaned up ${deletedFiles.length} orphaned files`
        : `Cleaned up ${deletedFiles.length} files with some errors`,
      errors: errors.length > 0 ? errors : undefined,
      deletedFiles: deletedFiles.length > 0 ? deletedFiles : undefined
    };
  } catch (error: any) {
    // Error cleaning up orphaned storage files
    return {
      success: false,
      message: 'Failed to clean up orphaned storage files',
      errors: [error.message]
    };
  }
};

// SQL query to find orphaned users (run in Supabase SQL editor)
export const findOrphanedUsersQuery = `
-- Find users in auth.users who don't have corresponding profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;
`;

// SQL query to find users with orphaned data (run in Supabase SQL editor)
export const findUsersWithOrphanedDataQuery = `
-- Find users who have profiles but missing related data
SELECT 
  p.id,
  p.username,
  p.created_at,
  CASE 
    WHEN sl.user_id IS NULL THEN 'No shortened links'
    ELSE 'Has shortened links'
  END as link_status,
  CASE 
    WHEN la.user_id IS NULL THEN 'No analytics'
    ELSE 'Has analytics'
  END as analytics_status
FROM profiles p
LEFT JOIN shortened_links sl ON p.id = sl.user_id
LEFT JOIN link_analytics la ON p.id = la.user_id
WHERE sl.user_id IS NULL AND la.user_id IS NULL
ORDER BY p.created_at DESC;
`;

// Utility function to validate user cleanup
export const validateUserCleanup = async (userId: string): Promise<{
  hasProfile: boolean;
  hasShortenedLinks: boolean;
  hasAnalytics: boolean;
  hasProfileViews: boolean;
  hasProfilePicture: boolean;
}> => {
  try {
    const [profileResult, linksResult, analyticsResult, viewsResult] = await Promise.all([
      supabase.from('profiles').select('id, profile_picture').eq('id', userId).single(),
      supabase.from('shortened_links').select('id').eq('user_id', userId).limit(1),
      supabase.from('link_analytics').select('id').eq('user_id', userId).limit(1),
      supabase.from('profile_views').select('id').eq('profile_id', userId).limit(1)
    ]);

    return {
      hasProfile: !!profileResult.data,
      hasShortenedLinks: !!linksResult.data?.length,
      hasAnalytics: !!analyticsResult.data?.length,
      hasProfileViews: !!viewsResult.data?.length,
      hasProfilePicture: !!profileResult.data?.profile_picture
    };
  } catch (error) {
    // Error validating user cleanup
    return {
      hasProfile: false,
      hasShortenedLinks: false,
      hasAnalytics: false,
      hasProfileViews: false,
      hasProfilePicture: false
    };
  }
};

export default {
  cleanupUserData,
  cleanupUserDataFallback,
  deleteUserCompletely,
  findOrphanedStorageFiles,
  cleanupOrphanedStorageFiles,
  findOrphanedUsersQuery,
  findUsersWithOrphanedDataQuery,
  validateUserCleanup
};
