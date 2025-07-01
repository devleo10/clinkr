import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Frame.png';
import { useAuth } from '../auth/AuthProvider';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth(); // Access the session from the AuthProvider

  const handleButtonClick = () => {
    if (session) {
      navigate('/dashboard');
    } else {
      navigate('/getstarted');
    }
  };

  const navigateToSection = (sectionId: string) => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        let yOffset;
        switch(sectionId) {
          case 'features':
            yOffset =20;
            break;
          case 'pricing':
            yOffset = -50;
            break;
          case 'faq':
            yOffset = -80;
            break;
          default:
            yOffset = -100;
        }
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/60 backdrop-blur-md shadow-sm border-b border-white/40 relative z-20"
    >
      {/* Logo and title section */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="Clinkr Logo" 
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" 
          />
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold relative group">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300">
            Clinkr
          </span>
          <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 group-hover:w-full transition-all duration-300"></div>
        </h1>
      </div>

      {/* Center nav links */}
      <div className="hidden sm:flex sm:items-center sm:space-x-6">
        <button 
          onClick={() => navigateToSection('features')} 
          className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
        >
          Features
        </button>
        <button 
          onClick={() => navigateToSection('pricing')} 
          className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
        >
          Pricing
        </button>
        <button 
          onClick={() => navigateToSection('faq')}
          className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
        >
          FAQ
        </button>
      </div>
      
      {/* Auth buttons */}
      <div className="space-x-2 flex items-center">
        <motion.button
          className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold px-6 py-2 rounded-xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all duration-300"
          onClick={handleButtonClick}
          type="button"
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.2)" 
          }}
          whileTap={{ scale: 0.95 }}
        >
          {session ? 'Visit Dashboard' : 'Get Started'}
        </motion.button>
        
        {/* Mobile menu dots */}
        <div className="relative sm:hidden ml-4">
          <div 
            className="flex flex-col gap-1 cursor-pointer group p-2"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-1 h-1 rounded-full bg-indigo-600 group-hover:bg-indigo-800"></div>
            <div className="w-1 h-1 rounded-full bg-indigo-600 group-hover:bg-indigo-800"></div>
            <div className="w-1 h-1 rounded-full bg-indigo-600 group-hover:bg-indigo-800"></div>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg py-1 z-10 border border-indigo-100"
              >
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    navigateToSection('features');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    navigateToSection('pricing');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    navigateToSection('faq');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                >
                  FAQ
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
