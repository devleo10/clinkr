import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { LayoutDashboard, Edit } from "lucide-react";
import { Link, useParams } from 'react-router-dom';
import logo from "../../assets/Frame.png";
import { supabase } from '../../lib/supabaseClient';
import { FaUser,FaLink, FaShare } from 'react-icons/fa';
import { SocialIcon } from 'react-social-icons';

interface UserProfile {
  full_name: string;
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
  const [editedFullName, setEditedFullName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        full_name: data.full_name || '',
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

  const handleFullNameUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: editedFullName })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, full_name: editedFullName } : null);
      setEditState(prev => ({ ...prev, fullName: false }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getSocialIcon = (url: string) => {
    if (typeof url !== 'string') return <SocialIcon url="https://example.com" style={{ width: 25, height: 25 }} />;
    return <SocialIcon url={url} style={{ width: 25, height: 25 }} />;
  };


  // Transform profile links into the required format
  const links = Array.isArray(profile?.links) ? profile.links.map((url, index) => {
    // Make sure we're returning a properly structured object with string values
    return {
      title: profile?.link_title && profile.link_title[index] 
        ? String(profile.link_title[index]) 
        : String(url),
      clicks: 0,
      icon: getSocialIcon(typeof url === 'string' ? url : ''),
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
  
  // Function to handle deleting a link
  const handleDeleteLink = async (index: number) => {
    if (!profile) return;
    const updatedLinks = profile.links.filter((_, i) => i !== index);
    const updatedLinkTitles = profile.link_title.filter((_, i) => i !== index);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
  
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
          <Link to="/dashboard">
            <Button variant="outline" className="flex items-center space-x-2">
              <LayoutDashboard size={16} />
              <span>View Dashboard</span>
            </Button>
          </Link>
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
                alt={profile.full_name}
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
    
          <div className="relative inline-block">
            {editState.fullName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedFullName}
                  onChange={(e) => setEditedFullName(e.target.value)}
                  className="text-2xl font-bold px-2 py-1 border rounded focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                  placeholder="Enter your name"
                />
                <button
                  onClick={handleFullNameUpdate}
                  className="p-1 text-[#4F46E5] hover:text-[#4338CA]"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="group relative inline-block">
                <h1 className="text-2xl font-bold inline-block">{profile?.full_name || 'Loading...'}</h1>
                <button
                  onClick={() => {
                    setEditedFullName(profile?.full_name || '');
                    setEditState(prev => ({ ...prev, fullName: true }));
                  }}
                  className="absolute -right-6 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Edit name"
                >
                  <Edit size={12} />
                </button>
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
            <input
              type="text"
              value={newLink.url}
              onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
              placeholder="Enter new link URL"
              className="border rounded-md p-2 w-full focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
            <input
              type="text"
              value={newLink.title}
              onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter link title"
              className="border rounded-md p-2 w-full focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
            <button
              onClick={handleAddLink}
              className="px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-[#4338CA] transition-colors w-full"
            >
              Add More Link
            </button>
            {linkError && <p className="text-red-500 text-sm text-center">{linkError}</p>}
          </div>
        </div>
    
        <div className="mt-6 space-y-4 max-w-md mx-auto">
          {links.map((link, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="flex-shrink-0">{getSocialIcon(link.url)}</span>
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
                  <a 
                    href={typeof link.url === 'string' ? link.url : ''} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#4F46E5] hover:text-[#4338CA] p-2"
                  >
                    ↗
                  </a>
                  <button
                    onClick={() => handleDeleteLink(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    aria-label="Delete link"
                  >
                    <FaLink />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
};

export default PrivateProfile;



