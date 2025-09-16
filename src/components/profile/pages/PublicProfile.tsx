import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { FaUser, FaShare, FaEllipsisV } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../../ui/loadingScreen';
import { getSocialIcon, getPlatformName } from '../../../lib/profile-utils';
import usePerformanceOptimization from '../../../hooks/usePerformanceOptimization';
import { usePublicProfile } from '../hooks/usePublicProfile';
import logo from '../../../assets/Frame.png';

const PublicProfile = () => {
  const { identifier } = useParams();
  const { profile, shortLinks, loading, error } = usePublicProfile(identifier || '');
  const { simplifiedAnimations } = usePerformanceOptimization();
  const [showMenu, setShowMenu] = useState(false);

  console.log('PublicProfile component mounted, identifier:', identifier);

  const handleLinkClick = (shortCode: string) => {
    // Navigate to the shortened link - this will trigger tracking in ShortenedLinkRedirect
    window.open(`/${shortCode}`, '_blank');
  };

  const handleCopyProfileUrl = () => {
    const profileUrl = window.location.href;
    navigator.clipboard.writeText(profileUrl).then(() => {
      alert('Profile URL copied to clipboard!');
    });
  };

  const handleContactUser = () => {
    // For now, just show an alert. In the future, this could open a contact form or email
    alert('Contact feature coming soon!');
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
        alert('Profile URL copied to clipboard!');
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
          <Link to="/homepage" className="mt-4 inline-block text-orange-400 hover:text-orange-500">
            Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.05),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(245,158,11,0.05),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.05),transparent_50%)]"></div>
      </div>

      {/* Subtle Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-xl"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-xl"
          animate={{ 
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full blur-xl"
          animate={{ 
            y: [0, -25, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-12">

        {/* Header with Brand and Actions - Horizontally Aligned */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Logo and Brand - Left Side */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/" className="flex items-center">
              <motion.img 
                src={logo} 
                alt="Clinkr Logo" 
                className="w-10 h-10" 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              />
            </Link>
            <Link to="/" className="group">
              <motion.h1 
                className="text-3xl font-bold text-gradient group-hover:scale-105 transition-transform duration-200"
                whileHover={{ scale: 1.05 }}
              >
                Clinkr
              </motion.h1>
            </Link>
          </motion.div>

          {/* Action Buttons - Right Side */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Share Profile Button */}
            <motion.button
              onClick={handleShareProfile}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaShare size={14} />
              <span className="text-sm font-medium">Share</span>
            </motion.button>

            {/* Three Dot Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEllipsisV className="w-5 h-5 text-gray-600" />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm border border-orange-200/50 rounded-xl py-2 shadow-lg z-30"
                  >
                    <button 
                      onClick={() => {
                        handleCopyProfileUrl();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy URL
                    </button>
                    <button 
                      onClick={() => {
                        handleContactUser();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Profile Picture - Larger Size, No Color Overlay */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="relative w-48 h-48 mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-xl">
              {profile?.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
                  alt={profile.username} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                  <FaUser size={60} className="text-white" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Username */}
        <motion.h1 
          className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {profile.username}
        </motion.h1>

        {/* Bio - Standalone Text */}
        {profile.bio && (
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-gray-700 text-base leading-relaxed font-medium">
              {profile.bio}
            </p>
          </motion.div>
        )}

        {/* Links - Wider */}
        <div className="space-y-4 mb-8">
          <AnimatePresence>
            {shortLinks.map((link, i) => (
              <motion.div 
                key={link.id} 
                initial={{ opacity: 0, y: 30, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  duration: 0.5, 
                  delay: simplifiedAnimations ? 0 : i * 0.1 + 0.8,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: simplifiedAnimations ? 1 : 1.02,
                  y: -2
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="group relative bg-white/95 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:bg-white hover:border-orange-300/70 transition-all duration-300 cursor-pointer"
                  onClick={() => handleLinkClick(link.short_code)}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200 transition-all duration-300 shadow-sm">
                      <div className="relative z-10">
                        {getSocialIcon(link.original_url, 20)}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate text-base group-hover:text-gray-900 transition-colors duration-300">
                        {getPlatformName(link.original_url)}
                      </h3>
                      <p className="text-sm text-gray-600 truncate mt-1 group-hover:text-gray-700 transition-colors duration-300">
                        {link.original_url.length > 60 ? `${link.original_url.slice(0, 60)}...` : link.original_url}
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200 transition-all duration-300">
                      <svg className="w-3 h-3 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-xl"></div>
              <div className="relative w-full h-full bg-white/90 backdrop-blur-sm border border-orange-200/50 rounded-full flex items-center justify-center shadow-lg">
                <FaUser size={24} className="text-gray-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No links yet</h3>
            <p className="text-gray-600 text-sm max-w-xs mx-auto leading-relaxed">
              This profile doesn't have any links to share at the moment.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;