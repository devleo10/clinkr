import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/Frame.png';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProfile = location.pathname.includes('profile');

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

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 mb-8"
    >
      {/* Animated gradient bar at the top */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 z-10"
        animate={{ 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ backgroundSize: '200% 200%' }}
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
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Profile</span>
            </motion.button>

            <motion.button
              onClick={handleLogout}
              className="text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;
