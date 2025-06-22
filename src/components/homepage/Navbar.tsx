import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Frame.png';
import { useAuth } from '../auth/AuthProvider';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth(); // Access the session from the AuthProvider

  const handleButtonClick = () => {
    if (session) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
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
    <nav className="border w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
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
          className="text-[rgba(75,85,99,1)] hover:text-[rgba(79,70,229,1)]"
        >
          Features
        </button>
        <button 
          onClick={() => navigateToSection('pricing')} 
          className="text-[rgba(75,85,99,1)] hover:text-[rgba(79,70,229,1)]"
        >
          Pricing
        </button>
        <button 
          onClick={() => navigateToSection('faq')}
          className="text-[rgba(75,85,99,1)] hover:text-[rgba(79,70,229,1)]"
        >
          FAQ
        </button>
      </div>
      {/* Auth buttons */}
      <div className="space-x-2 flex items-center">
        <button
          className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300"
          onClick={handleButtonClick}
        >
          {session ? 'Visit Dashboard' : 'Get Started'}
        </button>
        
        {/* Mobile menu dots */}
        <div className="relative sm:hidden ml-4">
          <div 
            className="flex flex-col gap-1 cursor-pointer group"
            onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown on click instead of hover
          >
            <div className="w-1 h-1 rounded-full bg-black group-hover:bg-[rgba(79,70,229,1)]"></div>
            <div className="w-1 h-1 rounded-full bg-black group-hover:bg-[rgba(79,70,229,1)]"></div>
            <div className="w-1 h-1 rounded-full bg-black group-hover:bg-[rgba(79,70,229,1)]"></div>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    navigateToSection('features');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(79,70,229,1)] hover:text-white"
                >
                  Features
                </button>
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    navigateToSection('pricing');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(79,70,229,1)] hover:text-white"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    navigateToSection('faq');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(79,70,229,1)] hover:text-white"
                >
                  FAQ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
