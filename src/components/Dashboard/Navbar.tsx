import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/Frame.png';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaUser, FaSignOutAlt, FaTrash } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProfile = location.pathname.includes('profile');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleProfileClick = () => {
    navigate('/privateprofile');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/homepage');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data, links, and profile.'
    );
    
    if (!confirmed) return;
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('No user found');
      
      // Import the cleanup functions
      const { cleanupUserData, cleanupUserDataFallback } = await import('../../lib/userCleanup');
      
      // Try Edge Function first
      let result = await cleanupUserData(user.id);
      
      // If Edge Function fails, fallback to client-side cleanup
      if (!result.success) {
        console.warn('Edge Function cleanup failed, falling back to client-side cleanup:', result.message);
        result = await cleanupUserDataFallback(user.id);
      }
      
      if (result.success) {
        alert('Account deleted successfully. You will be redirected to the homepage.');
        // Navigate to homepage
        navigate('/homepage');
      } else {
        console.error('Account deletion failed:', result.errors);
        alert(`Account deletion failed: ${result.message}. Please contact support if you continue to experience issues.`);
      }
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account: ' + error.message);
    }
  };

  const handleClearAllLinks = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all your shortened links? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('No user found');
      
      const { error: deleteError } = await supabase
        .from('shortened_links')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) throw deleteError;
      
      alert('All links have been deleted');
      // Refresh the page to update the dashboard
      window.location.reload();
    } catch (error) {
      console.error('Clear links error:', error);
      alert('Failed to delete links. Please try again.');
    }
  };

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 mb-8"
    >
      {/* Animated gradient bar at the top */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-[3px] z-10"
        style={{ 
          background: 'linear-gradient(to right, #B73D00, #ED7B00, #E66426)',
          backgroundSize: '200% 200%'
        }}
        animate={{ 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Completely transparent navbar - no background */}
      <nav className="relative px-4 sm:px-6 py-4">
        
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between relative z-10">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-2">
            <Link to="/homepage" className="flex items-center gap-1 sm:gap-2">
              <motion.img 
                src={logo} 
                alt="Clinkr Logo" 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 filter drop-shadow-lg"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, 5, -5, 0],
                  transition: { duration: 0.5 }
                }}
              />
              <motion.h1
                className="text-xl sm:text-2xl font-bold text-gradient group-hover:scale-105 transition-transform duration-200"
                whileHover={{ scale: 1.05 }}
              >
                Clinkr
              </motion.h1>
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleProfileClick}
              className={`btn-primary text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 ${
                isProfile ? 'opacity-100' : 'opacity-90'
              }`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaUser className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Profile</span>
            </motion.button>

            {/* Three-dot menu */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEllipsisV className="w-4 h-4 text-gray-600" />
              </motion.button>

              {/* Dropdown menu */}
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <button
                    onClick={() => {
                      handleClearAllLinks();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 flex items-center gap-3"
                  >
                    <FaTrash className="w-4 h-4 text-red-500" />
                    <span>Clear All Links</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => {
                      handleDeleteAccount();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <FaTrash className="w-4 h-4 text-red-500" />
                    <span>Delete Account</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <FaSignOutAlt className="w-4 h-4 text-gray-500" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;
