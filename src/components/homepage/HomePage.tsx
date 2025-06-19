import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Pricing from './Pricing';
import FAQ from './FAQ';
import Features from './Features';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import img from '../../assets/div.png';

const HomePage = () => {
  const { session } = useAuth(); // Access the session from the AuthProvider

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col w-full md:flex-row items-center justify-between py-16 gap-8">
          {/* Left Container */}
          <motion.div 
            className="flex-1 space-y-6 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold max-w-full overflow-hidden">
                <motion.div 
                  className="flex flex-col items-center md:items-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.span 
                    className="block w-full text-center md:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Track Every Click
                  </motion.span>
                  <motion.span 
                    className="block w-full text-center md:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    On Your Bio Links—
                  </motion.span>
                  <motion.span 
                    className="block w-full text-center md:text-left text-[#4F46E5]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    For Free!
                  </motion.span>
                </motion.div>
              </div>
              <motion.p className="text-gray-600 text-center md:text-left">
                See which links your audience loves. Optimize. Grow.
              </motion.p>
            </div>
            <motion.div 
              className="flex gap-4 pt-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.button 
                className="bg-[#4F46E5] text-white px-6 py-3 rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={session ? '/dashboard' : '/signup'}>
                  {session ? 'Visit Dashboard' : 'Get Started Free'}
                </Link>
              </motion.button>
              <motion.button 
                className="flex border items-center gap-2 px-6 py-3 rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo ▶
              </motion.button>
            </motion.div>
          </motion.div>
          {/* Right Container */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img 
              src={img}
              alt="Dashboard Preview"
              className="w-full max-w-lg mx-auto"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
        {/* Features Section */}
        <Features />
        <div id="pricing">
          <Pricing />
        </div>
        <div id="faq">
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export default HomePage;