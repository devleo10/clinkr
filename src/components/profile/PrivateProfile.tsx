import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../ui/card";
import { Edit } from "lucide-react";
import { Link, useParams, useNavigate } from 'react-router-dom';
import logo from "../../assets/Frame.png";
import { supabase } from '../../lib/supabaseClient';
import { FaUser,FaShare, FaTrash } from 'react-icons/fa';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useAuth } from '../auth/AuthProvider';
import LinkWithIcon from "../ui/linkwithicon";
import LinkValidator from "../../lib/link-validator";

interface UserProfile {
  username: string;
  bio: string;
  profile_picture: string | null;
  links: string[];
  link_title: string[];
  id: string;
}

interface EditState {
  fullName: boolean;
  bio: boolean;
  profilePicture: boolean;
}
const PrivateProfile = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/signup');
    }
  }, [session, navigate]);

  // Remove these state variable
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { username } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    fullName: false,
    bio: false,
    profilePicture: false
  });
  const [editedBio, setEditedBio] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)  // Add this line to filter by user ID
        .single();
  
      if (error) throw error;
  
      const profileData: UserProfile = {
        id: data.id,
        username: data.username || '',
        bio: data.bio || '',
        profile_picture: data.profile_picture,
        links: Array.isArray(data.links) ? data.links : (data.links ? JSON.parse(data.links) : []),
        link_title: Array.isArray(data.link_title) ? data.link_title : (data.link_title ? JSON.parse(data.link_title) : []),
      };
  
      setProfile(profileData);
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle image loading error
  const handleImageError = () => {
    setError('Failed to load profile picture');
    // Reset profile picture to default avatar
    if (profile) {
      setProfile({
        ...profile,
        profile_picture: null
      });
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // File validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size too large. Please choose an image under 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
  
      if (profile?.profile_picture) {
        // Extract full relative path (assuming profile_picture is a valid path)
        const previousFilePath = new URL(profile.profile_picture).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
      
        const { error: deleteError } = await supabase.storage
          .from('user-data')
          .remove([previousFilePath]);
      
        if (deleteError) throw deleteError;
      }
      
  
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  
      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('user-data')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
  
      if (uploadError) throw uploadError;
  
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-data')
        .getPublicUrl(fileName);
  
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: publicUrl })
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      setProfile(prev => prev ? { ...prev, profile_picture: publicUrl } : null);
      setEditState(prev => ({ ...prev, profilePicture: false }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBioUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ bio: editedBio })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, bio: editedBio } : null);
      setEditState(prev => ({ ...prev, bio: false }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  
  // Transform profile links into the required format
  const links = Array.isArray(profile?.links) ? profile.links.map((url, index) => {
    return {
      title: profile?.link_title && profile.link_title[index] 
        ? String(profile.link_title[index]) 
        : String(url),
      clicks: 0,
      url: typeof url === 'string' ? url : '',
    };
  }) : [];
  
  const [newLink, setNewLink] = useState({ url: '', title: '' });
  const [linkError, setLinkError] = useState<string | null>(null);
  
  // Function to handle adding a new link
  const handleAddLink = async () => {
    if (!newLink.url || !newLink.title) {
      setLinkError('Please enter both URL and title.');
      return;
    }
    if (profile && profile.links.length >= 5) {
      setLinkError('You can only add up to 5 links.');
      return;
    }
    setLinkError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
  
      // Store only the URL in the links array
      const updatedLinks = [...(profile?.links || []), newLink.url];
      
      // Store the title in the link_title array
      const updatedLinkTitles = [...(profile?.link_title || []), newLink.title];
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          links: updatedLinks,
          link_title: updatedLinkTitles 
        })
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      setProfile(prev => prev ? { 
        ...prev, 
        links: updatedLinks,
        link_title: updatedLinkTitles
      } : null);
      
      setNewLink({ url: '', title: '' });
    } catch (err: any) {
      setLinkError(err.message);
    }
  };
  
  const [linkToDeleteIndex, setLinkToDeleteIndex] = useState<number | null>(null);

  const handleDeleteLink = async () => {
    if (linkToDeleteIndex === null) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (!profile) return;

      const updatedLinks = profile.links.filter((_, index) => index !== linkToDeleteIndex);
      const updatedLinkTitles = profile.link_title.filter((_, index) => index !== linkToDeleteIndex);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ links: updatedLinks, link_title: updatedLinkTitles })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, links: updatedLinks, link_title: updatedLinkTitles } : null);
      setLinkToDeleteIndex(null); // Reset after deletion
    } catch (err: any) {
      setError(err.message);
    }
  };

  // New function to handle profile sharing
  const handleShareProfile = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`).then(() => {
        alert('Profile link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy link');
      });
    }
  }; // Updated URL construction

  // Delete profile handler
  const handleDeleteProfile = async () => {
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Delete profile picture from storage if exists
      if (profile?.profile_picture) {
        try {
          const previousFilePath = new URL(profile.profile_picture).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
          await supabase.storage.from('user-data').remove([previousFilePath]);
        } catch (e) {
          // Ignore storage errors
        }
      }

      // Delete all related analytics/views if needed (optional, add more as needed)
      await supabase.from('profile_views').delete().eq('profile_id', user.id);
      await supabase.from('link_analytics').delete().eq('profile_id', user.id);

      // Delete the profile itself
      const { error } = await supabase.from('profiles').delete().eq('id', user.id);
      if (error) throw error;

      // Optionally, sign out the user
      await supabase.auth.signOut();

      // Redirect to signup or homepage
      navigate('/signup');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Ensure rendering logic correctly uses profile state
  return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
        <Link to="/homepage" className="flex items-center gap-1 sm:gap-2">
              <img 
                src={logo} 
                alt="Clinkr Logo" 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold relative group">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300">
                  Clinkr
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </h1>
            </Link>
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300">
            <Link to='/dashboard'>
              Visit Dashboard
            </Link>
          </div>
        </div>
    
        {/* Profile Content */}
        <div className="text-center relative">
          {/* Profile Picture Section */}
          <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 relative group">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={profile.username}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <FaUser size={40} />
            )}
            {!loading && (
              <button
                onClick={() => setEditState(prev => ({ ...prev, profilePicture: true }))}
                className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Edit profile picture"
              >
                <Edit size={12} />
              </button>
            )}
            {editState.profilePicture && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
                <Edit className="text-white" size={20} />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </div>
            )}
            {error && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 text-xs py-1 px-2 rounded-md whitespace-nowrap">
                {error}
              </div>
            )}
          </div>
    
         
          <p className="text-[#4F46E5] mb-2">@{profile?.username}</p>
    
          <div className="relative inline-block">
            {editState.bio ? (
              <div className="mt-2">
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                  placeholder="Write your bio..."
                  rows={3}
                />
                <button
                  onClick={handleBioUpdate}
                  className="mt-2 px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-[#4338CA] transition-colors"
                >
                  Save Bio
                </button>
              </div>
            ) : (
              <div className="group relative inline-block">
                <p className="text-gray-600 mt-2">{profile?.bio}</p>
                <button
                  onClick={() => {
                    setEditedBio(profile?.bio || '');
                    setEditState(prev => ({ ...prev, bio: true }));
                  }}
                  className="absolute -right-6 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Edit bio"
                >
                  <Edit size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                onClick={handleShareProfile}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm text-[#4F46E5] hover:text-[#4338CA] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-md transition-colors"
              >
                <FaShare size={14} />
                Share Your Profile
              </button>
            </div>
          </div>
        </div>
    
        {/* Links Section */}
        <div className="mt-8 border-b pb-4">
          <div className="flex flex-col gap-2 max-w-md mx-auto">
            <LinkValidator url={newLink.url}>
              {(isValid, message) => (
                <>
                  <input
                    type="text"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="Enter new link URL"
                    className={`border rounded-md p-2 w-full focus:ring-[#4F46E5] focus:border-[#4F46E5] hover:border-[#4F46E5] ${!isValid && newLink.url ? "border-red-500" : ""}`}
                  />
                  {!isValid && newLink.url && (
                    <span className="text-xs text-red-500">{message}</span>
                  )}
                </>
              )}
            </LinkValidator>
            <input
              type="text"
              value={newLink.title}
              onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter link title"
              className="border rounded-md p-2 w-full focus:ring-[#4F46E5] focus:border-[#4F46E5] hover:border-[#4F46E5]"
            />
            <button
              onClick={handleAddLink}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300"
            >
              Add More Link
            </button>
            {linkError && <p className="text-red-500 text-sm text-center">{linkError}</p>}
          </div>
        </div>
    
        <div className="mt-6 space-y-4 max-w-md mx-auto">
          {links.map((link, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4 group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Use LinkWithIcon here */}
                  <LinkWithIcon url={link.url} />
                  <a 
                    href={typeof link.url === 'string' ? link.url : ''} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-800 hover:text-[#4F46E5] transition-colors truncate"
                  >
                    {typeof link.title === 'string' ? link.title : String(link.title)}
                  </a>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                 
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <FaTrash
      className="text-[#4F46E5] cursor-pointer transition-colors duration-200 hover:text-red-600"
      onClick={() => setLinkToDeleteIndex(index)}
    />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your link.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={() => setLinkToDeleteIndex(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300" onClick={handleDeleteLink}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delete Profile Button */}
        <div className="flex justify-center mt-8">
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <button
                className="bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-red-700 transition-all duration-300"
                type="button"
              >
                Delete Profile
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your profile and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteProfile}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Profile"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
};

export default PrivateProfile;



