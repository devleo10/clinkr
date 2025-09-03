import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Frame.png';
import { useAuth } from '../auth/AuthProvider';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            yOffset = 20;
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
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`w-full flex items-center justify-between px-6 sm:px-8 py-4 relative z-20 transition-all duration-300 ${
        scrolled 
          ? 'glass-card mx-4 mt-4 rounded-2xl shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      {/* Logo and brand section */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center">
          <motion.img 
            src={logo} 
            alt="Clinkr Logo" 
            className="w-8 h-8 sm:w-9 sm:h-9" 
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          />
        </Link>
        <Link to="/" className="group">
          <motion.h1 
            className="text-xl sm:text-2xl font-bold text-gradient group-hover:scale-105 transition-transform duration-200"
            whileHover={{ scale: 1.05 }}
          >
            Clinkr
          </motion.h1>
        </Link>
      </div>

      {/* Navigation links */}
      <div className="hidden lg:flex items-center space-x-8">
        <motion.button 
          onClick={() => navigateToSection('features')} 
          className="text-sm font-medium hover:scale-105 transition-all duration-200 focus-ring text-gray-600 hover:text-orange-600"
        >
          Features
        </motion.button>
        <motion.button 
          onClick={() => navigateToSection('pricing')} 
          className="text-sm font-medium hover:scale-105 transition-all duration-200 focus-ring text-gray-600 hover:text-orange-600"
        >
          Pricing
        </motion.button>
        <motion.button 
          onClick={() => navigateToSection('faq')}
          className="text-sm font-medium hover:scale-105 transition-all duration-200 focus-ring text-gray-600 hover:text-orange-600"
        >
          FAQ
        </motion.button>
        <Link 
          to="/about"
          className="text-sm font-medium hover:scale-105 transition-all duration-200 focus-ring text-gray-600 hover:text-orange-600"
        >
          About
        </Link>
      </div>
      
      {/* Auth buttons */}
      <div className="flex items-center gap-3">
        {!session && (
          <motion.button
            className="hidden sm:block text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/50 transition-all duration-200 focus-ring"
            style={{ color: 'var(--c-text-dim)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
        )}
        
        <motion.button
          className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-lg"
          onClick={handleButtonClick}
          type="button"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          {session ? 'Dashboard' : 'Get Started'}
        </motion.button>
        
        {/* Mobile menu button */}
        <div className="lg:hidden">
          <motion.button 
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
          
          {showDropdown && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-4 mt-2 w-48 glass-card rounded-xl py-2 z-30"
            >
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  navigateToSection('features');
                }}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors text-black"
              >
                Features
              </button>
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  navigateToSection('pricing');
                }}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors text-black"
              >
                Pricing
              </button>
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  navigateToSection('faq');
                }}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors text-black"
              >
                FAQ
              </button>
              <Link 
                to="/about"
                onClick={() => setShowDropdown(false)}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors text-black"
              >
                About
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
