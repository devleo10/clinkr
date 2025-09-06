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
      <div className="py-16 px-6 md:px-20" style={{ background: 'linear-gradient(to bottom, rgba(var(--background), 0.02), rgba(var(--c-bg), 0.04))' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 w-full">
          {/* Clinkr Column */}
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
              <Link to="/" className="group">
                <motion.h1 
                  className="text-xl sm:text-2xl font-bold text-gradient group-hover:scale-105 transition-transform duration-200"
                  whileHover={{ scale: 1.05 }}
                >
                  Clinkr
                </motion.h1>
              </Link>
            </div>

            <p className="text-sm mt-4" style={{ color: 'rgba(var(--foreground), 0.65)' }}>
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
            <h3 className="font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>Product</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(var(--foreground), 0.65)' }}>
              <li>
                <button 
                  onClick={() => handleNavigation('features')} 
                  className="transition-colors hover:text-[rgb(var(--c-accent-rgb))]"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('pricing')} 
                  className="transition-colors hover:text-[rgb(var(--c-accent-rgb))]"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('faq')} 
                  className="transition-colors hover:text-[rgb(var(--c-accent-rgb))]"
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
            <h3 className="font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>Legal</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(var(--foreground), 0.65)' }}>
              <li><Link to="/privacypolicy" className="transition-colors hover:text-[rgb(var(--c-accent-rgb))]">Privacy Policy</Link></li>
              <li><Link to="/termsofservice" className="transition-colors hover:text-[rgb(var(--c-accent-rgb))]">Terms of Service</Link></li>
              <li><Link to="/cookiepolicy" className="transition-colors hover:text-[rgb(var(--c-accent-rgb))]">Cookie Policy</Link></li>
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
            <h3 className="font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>Connect</h3>
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                className="transition-colors text-[rgba(var(--foreground),0.65)] hover:text-[rgb(var(--c-accent-rgb))]"
                whileHover={{ scale: 1.05 }}
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="transition-colors text-[rgba(var(--foreground),0.65)] hover:text-[rgb(var(--c-accent-rgb))]"
                whileHover={{ scale: 1.05 }}
              >
                <FaInstagram size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="transition-colors text-[rgba(var(--foreground),0.65)] hover:text-[rgb(var(--c-accent-rgb))]"
                whileHover={{ scale: 1.05 }}
              >
                <FaLinkedin size={20} />
              </motion.a>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-16 text-center text-sm" style={{ color: 'rgba(var(--foreground), 0.6)' }}>
          © 2025 Clinkr. All rights reserved.
        </div>
      </div>
    </motion.div>
  );
};

export default Footer;