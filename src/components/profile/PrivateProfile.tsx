import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../ui/card";
import { Edit } from "lucide-react";
import { Link, useParams, useNavigate } from 'react-router-dom';
import logo from "../../assets/Frame.png";
import { supabase } from '../../lib/supabaseClient';
import { FaUser,FaShare, FaTrash } from 'react-icons/fa';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useAuth } from '../auth/AuthProvider';
import LinkValidator from "../../lib/link-validator";
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import { Globe } from 'lucide-react';
import { SocialIcon } from 'react-social-icons';

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
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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
          if (profile.profile_picture) {
            let previousFilePath = '';
            if (profile.profile_picture) {
              previousFilePath = new URL(profile.profile_picture).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
              await supabase.storage.from('user-data').remove([previousFilePath]);
            }
          }
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

  // Helper to get cropped image blob
  async function getCroppedImg(imageSrc: string, crop: any) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas is empty'));
      }, 'image/png');
    });
  }
  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
  }

  // Helper for link icon (generic globe, clinkr logo, or social icon)
  const getSocialIcon = (url: string) => {
    if (typeof url !== 'string') return <Globe size={20} className="text-gray-400" />;
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      if (domain.includes('clinkr.live')) {
        return <img src={logo} alt="Clinkr" className="w-5 h-5 rounded-full bg-white border border-indigo-200" style={{objectFit:'contain', background:'#fff'}} />;
      }
      // Use react-social-icons for known domains
      if (/^(facebook|x|linkedin|github|instagram|youtube|tiktok|pinterest|snapchat|reddit|whatsapp|telegram|discord|medium|dribbble|behance|codepen|dev\.to|stackoverflow|twitch|slack|spotify|soundcloud|apple|google|amazon|paypal|patreon|buymeacoffee|substack|wordpress|blogspot|tumblr|flickr|vimeo|bandcamp|goodreads|kofi|strava|mastodon|kickstarter|producthunt|quora|rss|rss2|rss3|rss4|rss5)\./i.test(domain)) {
        return <SocialIcon url={url} style={{ width: 20, height: 20 }} />;
      }
      // Otherwise, generic globe
      return <Globe size={20} className="text-gray-400" />;
    } catch {
      return <Globe size={20} className="text-gray-400" />;
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
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300">
              <Link to='/dashboard'>
                Visit Dashboard
              </Link>
            </div>
            {/* Bin icon for delete profile */}
            <button
              className="p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Delete profile"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <FaTrash className="text-red-500" size={18} />
            </button>
          </div>
        </div>
    
        {/* Profile Content */}
        <div className="text-center relative">
          {/* Profile Picture Section */}
          <div className="w-28 h-28 mx-auto rounded-full bg-white flex items-center justify-center overflow-hidden mb-4 relative group shadow-lg border-4 border-white">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              </div>
            )}
            {profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={profile.username}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                style={{ filter: loading ? 'blur(2px)' : 'none' }}
              />
            ) : (
              <FaUser size={56} className="text-indigo-200" />
            )}
            {/* Overlay with update/delete on hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-white/80 via-white/40 to-transparent z-10">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                    fileInputRef.current.click();
                  }
                }}
                className="mb-2 flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-full shadow hover:bg-indigo-700 text-xs font-medium border border-indigo-200"
                aria-label="Update profile picture"
                disabled={loading}
              >
                <Edit size={14} />
                Update
              </button>
              {profile?.profile_picture && !loading && (
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const { data: userData, error: userError } = await supabase.auth.getUser();
                      if (userError || !userData?.user) throw new Error('No user found');
                      const previousFilePath = new URL(profile.profile_picture as string).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
                      await supabase.storage.from('user-data').remove([previousFilePath]);
                      const { error: updateError } = await supabase.from('profiles').update({ profile_picture: null }).eq('id', userData.user.id);
                      if (updateError) throw updateError;
                      setProfile(prev => prev ? { ...prev, profile_picture: null } : null);
                    } catch (err) {
                      if (err instanceof Error) {
                        setError(err.message || 'Failed to delete profile picture.');
                      } else {
                        setError('Failed to delete profile picture.');
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="mb-3 flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full shadow hover:bg-red-200 text-xs font-medium border border-red-200"
                  aria-label="Delete profile picture"
                  disabled={loading}
                >
                  <FaTrash size={13} />
                  Delete
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  setError('File size too large. Please choose an image under 5MB.');
                  e.target.value = '';
                  return;
                }
                if (!file.type.startsWith('image/')) {
                  setError('Please upload an image file.');
                  e.target.value = '';
                  return;
                }
                setSelectedImage(file);
                setCropModalOpen(true);
                e.target.value = '';
              }}
            />
            {/* Crop Modal */}
            <Modal
              isOpen={cropModalOpen}
              onRequestClose={() => setCropModalOpen(false)}
              ariaHideApp={false}
              style={{ overlay: { zIndex: 1000 } }}
            >
              <div className="flex flex-col items-center p-4">
                <h2 className="mb-2 font-bold">Crop your profile picture</h2>
                {selectedImage && (
                  <div className="relative w-64 h-64 bg-gray-100">
                    <Cropper
                      image={URL.createObjectURL(selectedImage)}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(_: any, croppedAreaPixels: any) => setCroppedAreaPixels(croppedAreaPixels)}
                    />
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setCropModalOpen(false)} disabled={loading}>Cancel</button>
                  <button
                    className={
                      'px-4 py-2 rounded text-white font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 shadow ' +
                      (loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300')
                    }
                    onClick={async () => {
                      if (!selectedImage || !croppedAreaPixels) return;
                      setLoading(true);
                      setError(null);
                      try {
                        const imageSrc = URL.createObjectURL(selectedImage);
                        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                        const { data: userData, error: userError } = await supabase.auth.getUser();
                        if (userError || !userData?.user) throw new Error('No user found');
                        if (profile?.profile_picture) {
                          try {
                            const previousFilePath = new URL(profile.profile_picture).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
                            await supabase.storage.from('user-data').remove([previousFilePath]);
                          } catch (e) { /* ignore */ }
                        }
                        const filePath = `avatars/${userData.user.id}-${Date.now()}.png`;
                        const { data, error } = await supabase.storage.from('user-data').upload(filePath, croppedBlob, { cacheControl: '3600', upsert: true });
                        if (error) {
                          setError('Upload failed: ' + error.message);
                          setLoading(false);
                          return;
                        }
                        let publicUrl = '';
                        if (data && data.path) {
                          const { data: urlData } = supabase.storage.from('user-data').getPublicUrl(data.path);
                          publicUrl = urlData.publicUrl;
                        } else {
                          const { data: urlData } = supabase.storage.from('user-data').getPublicUrl(filePath);
                          publicUrl = urlData.publicUrl;
                        }
                        if (!publicUrl) {
                          setError('Failed to get public URL for uploaded image.');
                          setLoading(false);
                          return;
                        }
                        const { error: updateError } = await supabase.from('profiles').update({ profile_picture: publicUrl }).eq('id', userData.user.id);
                        if (updateError) {
                          setError('Failed to update profile: ' + updateError.message);
                          setLoading(false);
                          return;
                        }
                        setProfile(prev => prev ? { ...prev, profile_picture: publicUrl } : null);
                        setCropModalOpen(false);
                        setSelectedImage(null);
                      } catch (err) {
                        if (err instanceof Error) {
                          setError(err.message || 'Failed to update profile picture.');
                        } else {
                          setError('Failed to update profile picture.');
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Uploading...</span>
                    ) : (
                      'Crop & Upload'
                    )}
                  </button>
                </div>
              </div>
            </Modal>
            {error && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 text-xs py-1 px-2 rounded-md whitespace-nowrap z-30">
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
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white rounded-md font-bold shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300"
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
                Get Your Link-in-Bio link
              </button>
            </div>
          </div>
        </div>
    
        {/* Links Section */}
        <div className="mt-8 border-b pb-4">
          <div className="mt-6 space-y-4 max-w-md mx-auto">
            {links.map((link, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-4 group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Use LinkWithIcon here */}
                    {getSocialIcon(link.url)}
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
          <div className="flex flex-col gap-2 max-w-md mx-auto mt-8">
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
    
        {/* Delete Profile Button */}
        {/* Removed the old button, keep only the AlertDialog trigger in the menu */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
    );
};

export default PrivateProfile;



