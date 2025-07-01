import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Pricing from './Pricing';
import FAQ from './FAQ';
import Features from './Features';
import { Link, Route, Routes } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import Footer from './Footer';
import About from './About';
import PhoneAnimation from './cards/PhoneAnimation'
import BoltBackground from './BoltBackground';

const HomePage = () => {
  const { session } = useAuth(); // Access the session from the AuthProvider

  return (
    <div className="relative overflow-hidden min-h-screen">
      <BoltBackground />
      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/about" element={<About />} />
        </Routes>
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
                      className="block w-full text-center md:text-left text-gray-800 text-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Track Every Click
                    </motion.span>
                    <motion.span 
                      className="block w-full text-center md:text-left text-gray-800 text-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      On Your Bio Links—
                    </motion.span>
                    <motion.span 
                      className="block w-full text-center md:text-left text-indigo-600 font-bold text-shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      For Free!
                    </motion.span>
                  </motion.div>
                </div>
                <motion.p className="text-gray-700 text-center md:text-left">
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
                  className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-600 transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={session ? '/dashboard' : '/getstarted'}>
                    {session ? 'Visit Dashboard' : 'Get Started Free'}
                  </Link>
                </motion.button>
                <motion.button 
                  className="flex border border-indigo-200 bg-white/90 backdrop-blur-sm items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-md text-indigo-700"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.95)", boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Watch Demo</span>
                  <span className="flex justify-center items-center bg-indigo-100 w-6 h-6 rounded-full text-indigo-600 text-xs">▶</span>
                </motion.button>
              </motion.div>
            </motion.div>
            {/* Right Container */}
            <motion.div 
              className="flex-1 relative h-[600px]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <PhoneAnimation />
            </motion.div>
          </div>
          {/* Features Section with enhanced card background */}
          <div className="relative z-10">
            <Features />
          </div>
          <div id="pricing" className="relative z-10">
            <Pricing />
          </div>
          <div id="faq" className="relative z-10">
            <FAQ />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;