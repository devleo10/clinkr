import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { FaUser, FaExternalLinkAlt, FaShare } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../../ui/loadingScreen';
import { getSocialIcon } from '../../../lib/profile-utils';
import usePerformanceOptimization from '../../../hooks/usePerformanceOptimization';
import { ShortLink } from '../../../lib/linkShorteningService';

interface UserProfile {
  username: string;
  bio: string;
  profile_picture: string | null;
  id: string;
}

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { simplifiedAnimations } = usePerformanceOptimization();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // First, get the profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
        
        if (profileError) throw profileError;
        
        const profile: UserProfile = {
          id: profileData.id,
          username: profileData.username || '',
          bio: profileData.bio || '',
          profile_picture: profileData.profile_picture,
        };
        
        setProfile(profile);
        
        // Then, get the shortened links for this user
        const { data: links, error: linksError } = await supabase
          .from('shortened_links')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (linksError) {
          console.error('Error fetching shortened links:', linksError);
          setShortLinks([]);
        } else {
          setShortLinks(links || []);
        }
        
      } catch (err: any) {
        setError(err?.message || 'Failed to load profile');
        setProfile(null);
        setShortLinks([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (username) fetchProfile();
  }, [username]);

  const handleLinkClick = (shortCode: string) => {
    // Navigate to the shortened link - this will trigger tracking in ShortenedLinkRedirect
    window.open(`/${shortCode}`, '_blank');
  };


  const handleShareProfile = async () => {
    const profileUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.username}'s Links`,
          text: `Check out ${profile?.username}'s links`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        // Could add a toast notification here if needed
      }
    } catch (err) {
      console.error('Failed to share profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600">{error || 'The requested profile does not exist.'}</p>
          <Link to="/homepage" className="mt-4 inline-block text-orange-600 hover:text-orange-700">
            Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 profile-bg-pattern opacity-30" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Picture */}
          <motion.div 
            className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 profile-picture-glow border-4 border-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {profile?.profile_picture ? (
              <img 
                src={profile.profile_picture} 
                alt={profile.username} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <FaUser size={48} className="text-white" />
              </div>
            )}
          </motion.div>

          {/* Username */}
          <motion.h1 
            className="text-2xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            @{profile.username}
          </motion.h1>

          {/* Bio */}
          {profile.bio && (
            <motion.p 
              className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {profile.bio}
            </motion.p>
          )}

          {/* Share Button */}
          <motion.button
            onClick={handleShareProfile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShare size={14} />
            Share Profile
          </motion.button>
        </motion.div>

        {/* Links */}
        <div className="space-y-3">
          <AnimatePresence>
            {shortLinks.map((link, i) => (
              <motion.div 
                key={link.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.4, 
                  delay: simplifiedAnimations ? 0 : i * 0.1 + 0.7,
                  ease: "easeOut"
                }}
                whileHover={{ scale: simplifiedAnimations ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="profile-link-card rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => handleLinkClick(link.short_code)}
                >
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl social-icon-container flex items-center justify-center group-hover:bg-white transition-colors duration-300 shadow-sm">
                      {getSocialIcon(link.original_url, 24)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-orange-700 transition-colors duration-300">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {link.original_url.length > 40 ? `${link.original_url.slice(0, 40)}...` : link.original_url}
                      </p>
                      <p className="text-xs text-orange-600 font-mono mt-1">
                        clinkr.live/{link.short_code}
                      </p>
                    </div>
                    
                    {/* External Link Icon */}
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300">
                      <FaExternalLinkAlt size={12} className="text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {shortLinks.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FaUser size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
            <p className="text-gray-500 text-sm">This profile doesn't have any links to share.</p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Link 
            to="/homepage" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors duration-200"
          >
            <span>Powered by</span>
            <span className="font-semibold">Clinkr</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicProfile;
