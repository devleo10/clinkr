import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Frame.png';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
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
    <nav className="border w-full flex items-center justify-between px-6 py-4">
      {/* Logo and title section */}
      <div className="flex items-center">
        <Link to="/">
          <img 
            src={logo} 
            alt="ClipMetrics Logo" 
            className="w-6 h-6 md:[w-10 h-10 mr-3 ml-2]" 
          />
        </Link>
        <h1 className="text-l md:[text-2xl font-bold text-black]">ClipMetrics</h1>
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
        <h4 
          className="bg-[rgba(79,70,229,1)] text-sm text-white rounded-md px-4 py-2 cursor-pointer transform active:scale-95 transition-transform hover:bg-[rgba(79,70,229,0.9)]"
          onClick={handleGetStarted}
        >
          Get Started
        </h4>
        
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
