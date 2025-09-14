import { Link, useParams } from 'react-router-dom';
import { FaUser, FaShare } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../../ui/loadingScreen';
import { getSocialIcon, getPlatformName } from '../../../lib/profile-utils';
import usePerformanceOptimization from '../../../hooks/usePerformanceOptimization';
import { usePublicProfile } from '../hooks/usePublicProfile';

const PublicProfile = () => {
  const { identifier } = useParams();
  const { profile, shortLinks, loading, error } = usePublicProfile(identifier || '');
  const { simplifiedAnimations } = usePerformanceOptimization();

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
        {/* App Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-orange-200/50 rounded-full shadow-lg">
            <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Clinkr
            </span>
          </div>
        </motion.div>

        {/* Profile Picture */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-white rounded-full p-2 shadow-xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                {profile?.profile_picture ? (
                  <img 
                    src={profile.profile_picture} 
                    alt={profile.username} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                    <FaUser size={40} className="text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-gray-200/20 rounded-full blur-xl scale-110"></div>
          </div>
        </motion.div>

        {/* Username */}
        <motion.h1 
          className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {profile.username}
        </motion.h1>

        {/* Bio Card */}
        {profile.bio && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="bg-white/95 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-base leading-relaxed font-medium">
                  {profile.bio}
                </p>
              </div>
            </div>
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          {/* Share Button */}
          <motion.button
            onClick={handleShareProfile}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShare size={16} className="group-hover:rotate-12 transition-transform duration-300" />
            <span>Share Profile</span>
          </motion.button>

          {/* Additional Action Buttons */}
          <div className="flex gap-3">
            {/* Copy URL Button */}
            <motion.button
              onClick={handleCopyProfileUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm border border-orange-200/50 text-gray-700 font-medium rounded-full shadow-lg hover:shadow-xl hover:bg-white hover:border-orange-300/70 transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy URL</span>
            </motion.button>

            {/* Contact Button */}
            <motion.button
              onClick={handleContactUser}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm border border-orange-200/50 text-gray-700 font-medium rounded-full shadow-lg hover:shadow-xl hover:bg-white hover:border-orange-300/70 transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Contact</span>
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        {shortLinks.length > 0 && (
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-orange-200/50 rounded-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">
                {shortLinks.length} {shortLinks.length === 1 ? 'link' : 'links'} available
              </span>
            </div>
          </motion.div>
        )}

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