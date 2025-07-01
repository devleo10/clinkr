import { Link } from 'react-router-dom';
import logo from '../../assets/Frame.png';
import { motion } from 'framer-motion';

const Navbar = () => {
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
        
        <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
          <div className="flex items-center justify-between w-full">
            {/* Logo + Brand */}
            <div className="flex items-center space-x-2 w-1/3">
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

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-4 w-1/3 justify-end">
              <Link to="/privateprofile">
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden glass-button bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-3 py-1 sm:px-6 sm:py-2 rounded-xl shadow-md hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 text-xs sm:text-base"
                >
                  <span className="relative z-10">Visit Profile</span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    animate={{
                      background: [
                        'linear-gradient(to right, rgba(168, 85, 247, 0.7), rgba(99, 102, 241, 0.7))',
                        'linear-gradient(to right, rgba(99, 102, 241, 0.7), rgba(59, 130, 246, 0.7))',
                        'linear-gradient(to right, rgba(59, 130, 246, 0.7), rgba(168, 85, 247, 0.7))'
                      ]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;
