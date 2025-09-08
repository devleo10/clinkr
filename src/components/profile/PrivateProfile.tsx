import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../ui/card";
import { Edit } from "lucide-react";
import { useParams } from 'react-router-dom';
// removed unused import: logo
import { supabase } from '../../lib/supabaseClient';
import { FaUser, FaShare, FaTrash, FaCopy, FaGripVertical } from 'react-icons/fa';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import LinkValidator from "../../lib/link-validator";
import { MoreVertical, GripVertical } from "lucide-react";
import { getSocialIcon } from '../../lib/profile-utils';
import { motion, Reorder } from 'framer-motion';
import LoadingScreen from '../ui/loadingScreen';
import CropModal from './CropModal';
import EditLinkModal from './EditLinkModal';
import ProfileHeader from './ProfileHeader';
// removed unused import: LinksList
import { useProfile } from './useProfile';

interface EditState {
  fullName: boolean;
  bio: boolean;
  profilePicture: boolean;
}
const PrivateProfile = () => {

  const { username } = useParams();
  const { profile, setProfile, loading, setLoading, error, setError, getCurrentUserId } = useProfile(username);
  const [editState, setEditState] = useState<EditState>({ fullName: false, bio: false, profilePicture: false });
  const [editedBio, setEditedBio] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [linkReorderMode, setLinkReorderMode] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [activeLinkMenu, setActiveLinkMenu] = useState<number | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const linkMenuRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
      
      // Close link menu when clicking outside
      if (activeLinkMenu !== null) {
        const linkMenuRef = linkMenuRefs.current[activeLinkMenu];
        if (linkMenuRef && !linkMenuRef.contains(event.target as Node)) {
          setActiveLinkMenu(null);
        }
      }
    };

    if (showActionsMenu || activeLinkMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu, activeLinkMenu]);

  // Removed redundant fetchProfile call, useProfile hook handles profile fetching

  const handleBioUpdate = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No user found');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ bio: editedBio })
        .eq('id', userId);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, bio: editedBio } : null);
      setEditState(prev => ({ ...prev, bio: false }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  
  // Transform profile links into the required format
  const links = (() => {
    return Array.isArray(profile?.links) ? profile.links.map((url, index) => ({
      title: profile?.link_title && profile.link_title[index] ? String(profile.link_title[index]) : String(url),
      clicks: 0,
      url: typeof url === 'string' ? url : '',
    })) : [];
  })();
  
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
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No user found');

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
        .eq('id', userId);

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
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No user found');

      if (!profile) return;

      const updatedLinks = profile.links.filter((_, index) => index !== linkToDeleteIndex);
      const updatedLinkTitles = profile.link_title.filter((_, index) => index !== linkToDeleteIndex);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ links: updatedLinks, link_title: updatedLinkTitles })
        .eq('id', userId);

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
        setToastMessage('Link copied to clipboard!');
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setShowToast(false), 2000);
      }).catch(() => {
        alert('Failed to copy link');
      });
    }
  }; // Updated URL construction

  // removed unused function: handlePreviewProfile

 
    

  // New function to copy individual link
  const handleCopyLink = (url: string, title: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setShowToast(true);
      setToastMessage(`${title} link copied!`);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setShowToast(false), 2000);
    });
  };

  // New function to handle link reordering
  const handleReorderLinks = async (newOrder: any[]) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No user found');
      
      const reorderedUrls = newOrder.map(item => item.url);
      const reorderedTitles = newOrder.map(item => item.title);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          links: reorderedUrls,
          link_title: reorderedTitles 
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      setProfile(prev => prev ? { 
        ...prev, 
        links: reorderedUrls,
        link_title: reorderedTitles
      } : null);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete profile handler
  const handleDeleteProfile = async () => {
    setDeleting(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No user found');

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
      await supabase.from('profile_views').delete().eq('profile_id', userId);
      await supabase.from('link_analytics').delete().eq('profile_id', userId);
      await supabase.from('profiles').delete().eq('profile_id', userId);
      // Delete the profile itself
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;

      // Optionally, sign out the user
      await supabase.auth.signOut();

      // Redirect to signup or homepage
  // removed stray navigate('/signup')
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };





  const [editLinkIndex, setEditLinkIndex] = useState<number | null>(null);
  const [editLinkData, setEditLinkData] = useState({ url: '', title: '' });

  const handleEditLink = (index: number) => {
    setEditLinkIndex(index);
    setEditLinkData({
      url: typeof links[index].url === 'string' ? links[index].url : '',
      title: typeof links[index].title === 'string' ? links[index].title : '',
    });
  };

  // Ensure rendering logic correctly uses profile state
  return (
  <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <ProfileHeader
          profile={profile}
          loading={loading}
          error={error}
          setError={setError}
          setLoading={setLoading}
          setProfile={setProfile}
          getCurrentUserId={getCurrentUserId}
          setSelectedImage={setSelectedImage}
          setCropModalOpen={setCropModalOpen}
          fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
          handleShareProfile={handleShareProfile}
          showToast={showToast}
          toastMessage={toastMessage}
          setEditedBio={setEditedBio}
          editState={editState}
          setEditState={setEditState}
          editedBio={editedBio}
          handleBioUpdate={handleBioUpdate}
        />
      
          {/* Profile Content */}
          <div className="text-center relative bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
          {/* Profile Picture Section */}
          <div className="w-32 h-32 mx-auto rounded-full p-1 flex items-center justify-center mb-4 relative shadow-sm border border-gray-100 bg-white">
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-20">
                  <LoadingScreen compact />
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
                <FaUser size={60} className="text-orange-200" />
              )}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-full">
              <button
                type="button"
                onClick={() => { if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click(); } }}
                className="mb-2 flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-gray-200"
                aria-label="Update profile picture"
                disabled={loading}
              >
                <Edit size={14} /> Update
              </button>
              {profile?.profile_picture && !loading && (
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const userId = await getCurrentUserId();
                      if (!userId) throw new Error('No user found');
                      const previousFilePath = new URL(profile.profile_picture as string).pathname.replace(/^\/storage\/v1\/object\/public\/user-data\//, '');
                      await supabase.storage.from('user-data').remove([previousFilePath]);
                      const { error: updateError } = await supabase.from('profiles').update({ profile_picture: null }).eq('id', userId);
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
                  className="mb-3 flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium border border-red-100"
                  aria-label="Delete profile picture"
                  disabled={loading}
                >
                  <FaTrash size={13} /> Delete
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
            <CropModal
              isOpen={cropModalOpen}
              onClose={() => {
                setCropModalOpen(false);
                setSelectedImage(null);
              }}
              selectedImage={selectedImage}
              onSuccess={(publicUrl) => {
                setProfile(prev => prev ? { ...prev, profile_picture: publicUrl } : null);
              }}
              onError={(error) => setError(error)}
              getCurrentUserId={getCurrentUserId}
              profile={profile || undefined}
            />
            
            {error && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 text-xs py-1 px-2 rounded-md whitespace-nowrap z-30">
                {error}
              </div>
            )}
          </div>
          
          <p className="text-orange-600 mb-2 font-medium">@{profile?.username}</p>
    
          <div className="relative inline-block">
            {editState.bio ? (
              <div className="mt-2">
                <textarea
                  value={editedBio}
                  onChange={(e) => {
                    if (e.target.value.length <= 160) setEditedBio(e.target.value);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-[#4F46E5] focus:border-transparent"
                  placeholder="Write your bio..."
                  rows={3}
                  maxLength={160}
                />
                <div className="text-xs text-gray-500 text-right mt-1">{editedBio.length}/160</div>
                <button
                  onClick={handleBioUpdate}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white rounded-md font-bold shadow hover:from-orange-500 hover:via-amber-500 hover:to-orange-600 transition-all duration-300"
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
              <motion.div 
                className="mb-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 border border-indigo-200 shadow text-indigo-700 font-semibold text-center"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span role="img" aria-label="star">⭐</span> Share your unique Link-in-Bio with the world!
              </motion.div>
              <button
                onClick={handleShareProfile}
                className="inline-flex items-center gap-1 px-4 py-2 text-base font-bold text-white bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 rounded-lg shadow-lg hover:from-orange-500 hover:via-amber-500 hover:to-orange-600 transition-all duration-300"
              >
                <FaShare size={16} />
                Get Your Link-in-Bio link
              </button>
              {showToast && (
                <div className="fixed left-1/2 bottom-4 -translate-x-1/2 flex justify-center items-center w-full pointer-events-none z-50">
                  <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out pointer-events-auto">
                    {toastMessage || 'Link copied to clipboard!'}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Links Section - Now part of the same card */}
          <div className="mt-8 border-t border-indigo-200 pt-8">
            {linkReorderMode && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 text-indigo-700">
                  <FaGripVertical size={16} />
                  <span className="text-sm font-medium">Reorder Mode Active - Drag links to reorder them</span>
                  <button
                    onClick={() => setLinkReorderMode(false)}
                    className="ml-auto text-orange-600 hover:text-orange-800 text-sm font-medium"
                  >
                    Exit
                  </button>
                </div>
              </div>
            )}
            <div className="mt-6 space-y-4 max-w-xl mx-auto">
            {linkReorderMode ? (
              <Reorder.Group 
                axis="y" 
                values={links} 
                onReorder={handleReorderLinks}
                className="space-y-4"
              >
                {links.map((link, index) => (
                  <Reorder.Item 
                    key={link.url + '-' + link.title + '-' + index} 
                    value={link}
                    className="cursor-move"
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl border-2 border-gray-100 bg-white/80 p-1 sm:p-2">
                      <CardContent className="flex items-center justify-between gap-2 md:gap-4 p-3 sm:p-4 md:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-grow min-w-0">
                          <GripVertical className="text-gray-400 cursor-move" size={16} />
                          <span className="flex-shrink-0">
                            {getSocialIcon(link.url, window.innerWidth < 640 ? 24 : 36)}
                          </span>
                          <div className="flex flex-col items-start w-full min-w-0">
                            <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate w-full">{link.title}</span>
                            <span className="text-xs sm:text-sm text-gray-500 truncate block w-full">
                              {typeof link.url === 'string' && link.url.length > (window.innerWidth < 640 ? 20 : 38) ? 
                                link.url.slice(0, window.innerWidth < 640 ? 17 : 35) + '...' : link.url}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              links.map((link, index) => (
                <motion.div
                  key={link.url + '-' + link.title + '-' + index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (index * 0.1) + 0.4 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl border-2 border-gray-100 bg-white/80 p-1 sm:p-2">
                    <CardContent className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-grow min-w-0">
                        <span className="flex-shrink-0">
                          {getSocialIcon(link.url, window.innerWidth < 640 ? 24 : 36)}
                        </span>
                        <div className="flex flex-col items-start w-full min-w-0">
                          <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate w-full">{link.title}</span>
                          <a
                            href={typeof link.url === 'string' ? link.url : ''}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-gray-500 hover:text-orange-600 transition-colors block truncate w-full"
                          >
                            {typeof link.url === 'string' && link.url.length > (window.innerWidth < 640 ? 20 : 38) ? 
                              link.url.slice(0, window.innerWidth < 640 ? 17 : 35) + '...' : link.url}
                          </a>
                        </div>
                      </div>
                      
                      {/* Three-dot menu */}
                      <div 
                        className="relative flex-shrink-0" 
                        ref={(el) => {
                          linkMenuRefs.current[index] = el;
                        }}
                      >
                        <button
                          className="p-1 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                          aria-label="Link options"
                          onClick={() => setActiveLinkMenu(activeLinkMenu === index ? null : index)}
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>

                        {/* Dropdown menu */}
                        {activeLinkMenu === index && (
                          <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-40 z-50">
                            <button
                              className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-sm"
                              onClick={() => {
                                handleCopyLink(link.url, link.title);
                                setActiveLinkMenu(null);
                              }}
                            >
                              <FaCopy className="text-blue-500" size={14} />
                              Copy Link
                            </button>
                            
                            <button
                              className="w-full px-4 py-2 text-left hover:bg-indigo-50 flex items-center gap-3 text-sm"
                              onClick={() => {
                                handleEditLink(index);
                                setActiveLinkMenu(null);
                              }}
                            >
                              <Edit className="text-indigo-500" size={14} />
                              Edit Link
                            </button>
                            
                            <div className="border-t border-gray-200 my-1"></div>
                            
                            <button
                              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                              onClick={() => {
                                setLinkToDeleteIndex(index);
                                setActiveLinkMenu(null);
                              }}
                            >
                              <FaTrash className="text-red-500" size={14} />
                              Delete Link
                            </button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
          
          <motion.div 
            className="flex flex-col gap-2 max-w-md mx-auto mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <LinkValidator url={newLink.url}>
              {(isValid, message) => (
                <div className="relative">
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
                </div>
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
              className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:from-orange-500 hover:via-amber-500 hover:to-orange-600 transition-all duration-300"
            >
              Add More Link
            </button>
            {linkError && <p className="text-red-500 text-sm text-center">{linkError}</p>}
          </motion.div>
          </div>
    
        {/* Delete Link Confirmation Dialog */}
        <AlertDialog open={linkToDeleteIndex !== null} onOpenChange={() => setLinkToDeleteIndex(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your link.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={() => setLinkToDeleteIndex(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:from-orange-500 hover:via-amber-500 hover:to-orange-600 transition-all duration-300" onClick={handleDeleteLink}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
        <EditLinkModal
          isOpen={editLinkIndex !== null}
          onClose={() => {
            setEditLinkIndex(null);
            setEditLinkData({ url: '', title: '' });
          }}
          editLinkData={editLinkData}
          onSave={(updatedLinks, updatedTitles) => {
            setProfile(prev => prev ? { ...prev, links: updatedLinks, link_title: updatedTitles } : null);
            setEditLinkIndex(null);
            setEditLinkData({ url: '', title: '' });
          }}
          onError={(error) => setError(error)}
          getCurrentUserId={getCurrentUserId}
          profile={profile}
          editLinkIndex={editLinkIndex}
        />
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
    </div>
  );
}

export default PrivateProfile;