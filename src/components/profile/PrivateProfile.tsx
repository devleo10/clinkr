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
import { MoreVertical } from "lucide-react";

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

  // Toast notification state
  const [showToast, setShowToast] = useState(false);

  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

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
        setShowToast(true);
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setShowToast(false), 2000);
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
      await supabase.from('profiles').delete().eq('profile_id', user.id);
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
  const getSocialIcon = (url: string, size: number = 25) => {
    if (typeof url !== 'string') return <Globe size={size} className="text-gray-400" />;
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      if (domain.includes('clinkr.live')) {
        return <img src={logo} alt="Clinkr" className={`w-[${size}px] h-[${size}px] rounded-full bg-white border border-indigo-200`} style={{objectFit:'contain', background:'bg-gradient-to-r from-pink-100 to-purple-100 opacity-20 blur-3xl -z-10', width: size, height: size}} />;
      }
      // Try to fetch favicon/logo for all other domains
      return (
        <img
          src={`https://logo.clearbit.com/${domain}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
          }}
          alt={`${domain} icon`}
          style={{ width: size, height: size, borderRadius: '50%', background: '#fff', objectFit: 'contain', border: '1px solid #e0e7ff' }}
        />
      );
    } catch {
      return <Globe size={size} className="text-gray-400" />;
    }
  };

  const [editLinkIndex, setEditLinkIndex] = useState<number | null>(null);
  const [editLinkData, setEditLinkData] = useState({ url: '', title: '' });
  const [editLinkError, setEditLinkError] = useState<string | null>(null);

  const handleEditLink = (index: number) => {
    setEditLinkIndex(index);
    setEditLinkData({
      url: typeof links[index].url === 'string' ? links[index].url : '',
      title: typeof links[index].title === 'string' ? links[index].title : '',
    });
    setEditLinkError(null);
  };

  const handleEditLinkSave = async () => {
    if (!editLinkData.url || !editLinkData.title) {
      setEditLinkError('Please enter both URL and title.');
      return;
    }
    if (profile && editLinkIndex !== null) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');
        const updatedLinks = [...profile.links];
        const updatedLinkTitles = [...profile.link_title];
        updatedLinks[editLinkIndex] = editLinkData.url;
        updatedLinkTitles[editLinkIndex] = editLinkData.title;
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ links: updatedLinks, link_title: updatedLinkTitles })
          .eq('id', user.id);
        if (updateError) throw updateError;
        setProfile(prev => prev ? { ...prev, links: updatedLinks, link_title: updatedLinkTitles } : null);
        setEditLinkIndex(null);
        setEditLinkData({ url: '', title: '' });
      } catch (err: any) {
        setEditLinkError(err.message);
      }
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
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-400 p-1 flex items-center justify-center overflow-visible mb-4 relative shadow-lg group">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                </div>
              )}
              {profile?.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={profile.username}
                  className="w-full h-full object-cover rounded-full transition-transform duration-200 group-hover:scale-105"
                  style={{ filter: loading ? 'blur(2px)' : 'none', background: 'transparent' }}
                />
              ) : (
                <FaUser size={60} className="text-indigo-200" />
              )}
            </div>
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
                      <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 008-8v4a4 4 0 00-4 4H4z"></path></svg>Uploading...</span>
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
                  onChange={(e) => {
                    if (e.target.value.length <= 160) setEditedBio(e.target.value);
                  }}
                  className="w-full p-2 border rounded-md  focus:ring-[#4F46E5] focus:border-transparent"
                  placeholder="Write your bio..."
                  rows={3}
                  maxLength={160}
                />
                <div className="text-xs text-gray-500 text-right mt-1">{editedBio.length}/160</div>
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
            <div className="flex flex-col items-center justify-center gap-2 mb-2">
              {/* Highlighted callout with app color palette */}
              <div className="mb-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 border border-indigo-200 shadow text-indigo-700 font-semibold text-center animate-pulse">
                <span role="img" aria-label="star">⭐</span> Share your unique Link-in-Bio with the world!
              </div>
              <button
                onClick={handleShareProfile}
                className="inline-flex items-center gap-1 px-4 py-2 text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 rounded-lg shadow-lg hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 border-2 border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
              >
                <FaShare size={16} />
                Get Your Link-in-Bio link
              </button>
              {showToast && (
                <div className="fixed left-1/2 bottom-4 -translate-x-1/2 flex justify-center items-center w-full pointer-events-none z-50">
                  <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out pointer-events-auto">
                    Link copied to clipboard!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    
        {/* Links Section */}
        <div className="mt-8 border-b pb-4">
          <div className="mt-6 space-y-4 max-w-xl mx-auto">
            {links.map((link, index) => (
        <Card key={link.url + '-' + link.title + '-' + index} className="hover:shadow-lg transition-shadow rounded-2xl border-2 border-gray-100 bg-white/80 p-2">
                  <CardContent className="flex items-center justify-between gap-2 md:gap-4 p-6">
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                      <span className="flex-shrink-0">
                        {getSocialIcon(link.url, 36)}
                      </span>
                   <div className="flex flex-col items-start w-full">
                      <span className="text-lg font-semibold text-gray-900 truncate">{link.title}</span>
                      <a
                        href={typeof link.url === 'string' ? link.url : ''}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors block"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                          maxWidth: '100%'
                        }}
                      >
                        {typeof link.url === 'string' && link.url.length > 38 ? link.url.slice(0, 35) + '...' : link.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <button
                      className="p-2 rounded-full hover:bg-gradient-to-r hover:from-purple-100 hover:via-indigo-100 hover:to-blue-100 focus:outline-none transition-colors"
                      aria-label="Edit link"
                      onClick={() => handleEditLink(index)}
                    >
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </button>
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

        {/* Edit Link Modal */}
        {editLinkIndex !== null && (
          <Modal
            isOpen={editLinkIndex !== null}
            onRequestClose={() => setEditLinkIndex(null)}
            ariaHideApp={false}
            style={{ overlay: { zIndex: 1000 } }}
          >
            <div className="flex flex-col items-center p-4">
              <h2 className="mb-2 font-bold">Edit Link</h2>
              <input
                type="text"
                value={editLinkData.url}
                onChange={e => setEditLinkData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Edit link URL"
                className="border rounded-md p-2 w-full mb-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] hover:border-[#4F46E5]"
              />
              <input
                type="text"
                value={editLinkData.title}
                onChange={e => setEditLinkData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Edit link title"
                className="border rounded-md p-2 w-full mb-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] hover:border-[#4F46E5]"
              />
              {editLinkError && <span className="text-xs text-red-500 mb-2">{editLinkError}</span>}
              <div className="flex gap-2 mt-2">
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setEditLinkIndex(null)}>Cancel</button>
                <button
                  className="px-4 py-2 rounded text-white font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300"
                  onClick={handleEditLinkSave}
                >
                  Save
                </button>
              </div>
            </div>
          </Modal>
        )}
        <style>{`
@keyframes fade-in-out {
  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
  10% { opacity: 1; transform: translateY(0) scale(1); }
  90% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(20px) scale(0.95); }
}
.animate-fade-in-out {
  animation: fade-in-out 2s;
}
`}</style>
      </div>
    );
};

export default PrivateProfile;


