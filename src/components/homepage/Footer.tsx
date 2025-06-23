import { FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import logo from "../../assets/Frame.png";
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (sectionId: string) => {
    if (location.pathname !== '/homepage') {
      // If not on homepage, navigate to homepage first
      navigate('/homepage');
      // Wait for navigation to complete then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If already on homepage, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-[#111827] text-white py-12 px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
          {/* ClipMetrics Column */}
          <div className='w-full'>
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

            <p className="text-sm text-gray-400">
              Track, analyze, and optimize your bio links for maximum engagement.
            </p>
          </div>
          
          {/* Product Column */}
          <div className='w-full'>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button 
                  onClick={() => handleNavigation('pricing')} 
                  className="hover:text-white"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('pricing')} 
                  className="hover:text-white"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('faq')} 
                  className="hover:text-white"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div className='w-full'>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>
          
          {/* Connect Column */}
          <div className='w-full'>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center text-sm text-gray-400">
          © 2025 ClipMetrics. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;