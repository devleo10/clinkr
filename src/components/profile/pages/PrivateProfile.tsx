import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from "../../ui/card";
import { supabase } from '../../../lib/supabaseClient';
import { FaTrash, FaCopy, FaGripVertical, FaChartLine } from 'react-icons/fa';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";
import LinkValidator from "../../../lib/link-validator";
import { MoreVertical, GripVertical } from "lucide-react";
import { getSocialIcon } from '../../../lib/profile-utils';
import { motion, Reorder } from 'framer-motion';
import LoadingScreen from '../../ui/loadingScreen';
import { CropModal } from '../modals';
import { ProfileHeader } from '../components';
import { useProfile } from '../hooks';
import usePerformanceOptimization from '../../../hooks/usePerformanceOptimization';
import { linkShorteningService, ShortLink } from '../../../lib/linkShorteningService';
import { useAuth } from '../../auth/AuthProvider';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

interface EditState {
  fullName: boolean;
  bio: boolean;
  profilePicture: boolean;
}

const PrivateProfile = () => {
  const { profile, setProfile, loading, setLoading, error, setError, getCurrentUserId } = useProfile();
  const { simplifiedAnimations } = usePerformanceOptimization();
  const { session } = useAuth();
  
  // State management
  const [editState, setEditState] = useState<EditState>({ fullName: false, bio: false, profilePicture: false });
  const [editedBio, setEditedBio] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [linkReorderMode, setLinkReorderMode] = useState(false);
  const [activeLinkMenu, setActiveLinkMenu] = useState<number | null>(null);
  const [linkToDeleteIndex, setLinkToDeleteIndex] = useState<number | null>(null);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const linkMenuRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Close link menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeLinkMenu !== null) {
        const linkMenuRef = linkMenuRefs.current[activeLinkMenu];
        if (linkMenuRef && !linkMenuRef.contains(event.target as Node)) {
          setActiveLinkMenu(null);
        }
      }
    };

    if (activeLinkMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeLinkMenu]);

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

  
  // Transform shortened links into the required format
  const links = shortLinks.map(link => ({
    id: link.id,
    title: link.title || 'Untitled',
    clicks: link.clicks,
    url: link.original_url,
    short_code: link.short_code,
    created_at: link.created_at,
    is_active: link.is_active,
  }));

  // Fetch user's short links on component mount
  useEffect(() => {
    const fetchShortLinks = async () => {
      if (!session?.user?.id) return;

      try {
        const links = await linkShorteningService.getUserShortLinks(session.user.id);
        setShortLinks(links);
      } catch (err: any) {
        console.error('Failed to fetch short links:', err.message);
        // Don't set error state, just log it
      }
    };

    fetchShortLinks();
  }, [session?.user?.id]);
  

  const handleDeleteLink = async () => {
    if (linkToDeleteIndex === null) return;

    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No user found');

      const linkToDelete = shortLinks[linkToDeleteIndex];
      if (!linkToDelete) return;

      await linkShorteningService.deleteShortLink(linkToDelete.short_code, userId);
      setShortLinks(prev => prev.filter((_, index) => index !== linkToDeleteIndex));
      setLinkToDeleteIndex(null);
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
      
      // For shortened links, we'll update the order by updating created_at timestamps
      // This is a simple approach - in a more advanced system, you'd have an order column
      const updates = newOrder.map((item: any, index: number) => ({
        short_code: item.short_code,
        new_order: index
      }));
      
      // Update each link's order (using created_at as a proxy for order)
      for (const update of updates) {
        const newTimestamp = new Date(Date.now() - (update.new_order * 1000)).toISOString();
        await supabase
          .from('shortened_links')
          .update({ created_at: newTimestamp })
          .eq('short_code', update.short_code)
          .eq('user_id', userId);
      }
      
      // Refresh the shortLinks to reflect new order
      const updatedLinks = await linkShorteningService.getUserShortLinks(userId);
      setShortLinks(updatedLinks);
      
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

      // Import the cleanup functions
      const { cleanupUserData, cleanupUserDataFallback } = await import('../../../lib/userCleanup');
      
      // Try Edge Function first
      let result = await cleanupUserData(userId);
      
      // If Edge Function fails, fallback to client-side cleanup
      if (!result.success) {
        console.warn('Edge Function cleanup failed, falling back to client-side cleanup:', result.message);
        result = await cleanupUserDataFallback(userId);
      }
      
      if (result.success) {
        // Redirect to homepage
        window.location.href = '/homepage';
      } else {
        setError(result.message || 'Failed to delete profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600">{error || 'The requested profile does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 profile-bg-pattern opacity-30" />
      
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
          
        {/* Links Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          {linkReorderMode && (
            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 text-orange-500">
                <FaGripVertical size={16} />
                <span className="text-sm font-medium">Reorder Mode Active - Drag links to reorder them</span>
                <button
                  onClick={() => setLinkReorderMode(false)}
                  className="ml-auto text-orange-400 hover:text-orange-500 text-sm font-medium"
                >
                  Exit
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {linkReorderMode ? (
              <Reorder.Group 
                axis="y" 
                values={links} 
                onReorder={handleReorderLinks}
                className="space-y-4"
              >
                {links.map((link: any, index: number) => (
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
              links.map((link: any, index: number) => (
                <motion.div
                  key={link.url + '-' + link.title + '-' + index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: simplifiedAnimations ? 0 : (index * 0.1) + 0.2,
                    ease: "easeOut"
                  }}
                  whileHover={{ scale: simplifiedAnimations ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                            className="text-xs sm:text-sm text-gray-500 hover:text-orange-400 transition-colors block truncate w-full"
                          >
                            {typeof link.url === 'string' && link.url.length > (window.innerWidth < 640 ? 20 : 38) ? 
                              link.url.slice(0, window.innerWidth < 640 ? 17 : 35) + '...' : link.url}
                          </a>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-orange-400 font-mono bg-orange-50 px-2 py-1 rounded">
                              {linkShorteningService.getShortLinkUrl(link.short_code)}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FaChartLine size={10} />
                              {link.clicks} clicks
                            </span>
                          </div>
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
                              Copy Original Link
                            </button>
                            
                            <button
                              className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center gap-3 text-sm"
                              onClick={() => {
                                navigator.clipboard.writeText(linkShorteningService.getShortLinkUrl(link.short_code));
                                setShowToast(true);
                                setToastMessage('Short link copied!');
                                if (toastTimeout.current) clearTimeout(toastTimeout.current);
                                toastTimeout.current = setTimeout(() => setShowToast(false), 2000);
                                setActiveLinkMenu(null);
                              }}
                            >
                              <FaCopy className="text-orange-500" size={14} />
                              Copy Short Link
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
            className="flex flex-col gap-4 max-w-md mx-auto mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: simplifiedAnimations ? 0.2 : 0.8 
            }}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to add more links?</h3>
              <p className="text-sm text-gray-600 mb-4">Use our advanced dashboard to create and manage your links with full analytics and features.</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 text-white font-medium rounded-lg shadow hover:from-orange-500 hover:via-amber-500 hover:to-orange-500 transition-all duration-300"
              >
                <FaPlus size={16} />
                Go to Dashboard
              </Link>
            </div>
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
              <AlertDialogAction className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 text-white font-bold px-6 py-2 rounded-lg shadow hover:from-orange-500 hover:via-amber-500 hover:to-orange-500 transition-all duration-300" onClick={handleDeleteLink}>Continue</AlertDialogAction>
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

        {/* Edit Link Modal - Removed for now as it needs to be updated for shortened links */}
        {/* <EditLinkModal
          isOpen={editLinkIndex !== null}
          onClose={() => {
            setEditLinkIndex(null);
            setEditLinkData({ url: '', title: '' });
          }}
          editLinkData={editLinkData}
          onSave={(updatedLinks: any, updatedTitles: any) => {
            setProfile(prev => prev ? { ...prev, links: updatedLinks, link_title: updatedTitles } : null);
            setEditLinkIndex(null);
            setEditLinkData({ url: '', title: '' });
          }}
          onError={(error: any) => setError(error)}
          getCurrentUserId={getCurrentUserId}
          profile={profile}
          editLinkIndex={editLinkIndex}
        /> */}
      </div>
    </div>
  );
}

export default PrivateProfile;