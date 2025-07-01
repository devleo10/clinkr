import { FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import logo from "../../assets/Frame.png";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="flex flex-col"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="bg-gradient-to-b from-gray-900 to-indigo-900 text-white py-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 w-full">
          {/* ClipMetrics Column */}
          <motion.div 
            className='w-full'
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/" className="flex items-center">
                <img 
                  src={logo} 
                  alt="Clinkr Logo" 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" 
                />
              </Link>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold relative group">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-300 hover:from-blue-300 hover:via-indigo-400 hover:to-purple-500 transition-all duration-300">
                  Clinkr
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-300 group-hover:w-full transition-all duration-300"></div>
              </h1>
            </div>

            <p className="text-sm text-indigo-200 mt-4">
              Track, analyze, and optimize your bio links for maximum engagement.
            </p>
          </motion.div>
          
          {/* Product Column */}
          <motion.div 
            className='w-full'
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3 text-sm text-indigo-200">
              <li>
                <button 
                  onClick={() => handleNavigation('features')} 
                  className="hover:text-white transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('pricing')} 
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('faq')} 
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About</Link>
              </li>
            </ul>
          </motion.div>
          
          {/* Legal Column */}
          <motion.div 
            className='w-full'
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-3 text-sm text-indigo-200">
              <li><Link to="/privacypolicy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/termsofservice" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookiepolicy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </motion.div>
          
          {/* Connect Column */}
          <motion.div 
            className='w-full'
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold mb-4 text-white">Connect</h3>
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                className="text-indigo-200 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-indigo-200 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <FaInstagram size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-indigo-200 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <FaLinkedin size={20} />
              </motion.a>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-16 text-center text-sm text-indigo-200">
          © 2025 ClipMetrics. All rights reserved.
        </div>
      </div>
    </motion.div>
  );
};

export default Footer;