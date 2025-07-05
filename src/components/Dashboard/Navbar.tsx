import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/Frame.png';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const isProfile = location.pathname.includes('profile');

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 mb-8"
    >
      {/* Animated gradient bar at the top */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 z-10"
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

      {/* Glassmorphism effect with additional subtle highlights */}
      <nav className="relative border-b border-white/20 px-4 sm:px-6 py-4 backdrop-blur-lg shadow-lg">
        <div className="absolute inset-0 bg-white/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-blue-500/5 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-md" />
        
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between relative z-10">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
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
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold relative group">
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 transition-all duration-300"
                  whileHover={{ 
                    backgroundImage: 'linear-gradient(to right, #3b82f6, #6366f1, #9333ea)'
                  }}
                >
                  Clinkly
                </motion.span>
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </h1>
            </Link>
          </div>

          

            <Link to="/privateprofile">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                className={`relative overflow-hidden glass-button ${
                  isProfile 
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold px-6 py-2 rounded-xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all duration-300'

                } font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md transition-all duration-300 text-xs sm:text-sm md:text-base flex items-center gap-2`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Profile</span>
              </motion.button>
            </Link>
          </div>
        
      </nav>
    </motion.div>
  );
};

export default Navbar;
