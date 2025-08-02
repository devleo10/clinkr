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
          <div className="flex flex-col w-full md:flex-row items-center justify-between py-20 gap-12">
            {/* Left Container */}
            <motion.div 
              className="flex-1 space-y-8 text-center md:text-left max-w-2xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6">
                <div className="text-5xl md:text-7xl font-black max-w-full overflow-hidden leading-tight">
                  <motion.div 
                    className="flex flex-col items-center md:items-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.span 
                      className="block w-full text-center md:text-left text-gray-900 tracking-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Track Every
                    </motion.span>
                    <motion.span 
                      className="block w-full text-center md:text-left bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Click & Link
                    </motion.span>
                    <motion.div
                      className="flex items-center gap-3 text-center md:text-left"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <span className="text-gray-900">With</span>
                      <div className="relative">
                        <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent font-black">
                          Zero Cost
                        </span>
                        <motion.div
                          className="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 1, duration: 0.8 }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
                <motion.p 
                  className="text-xl text-gray-600 text-center md:text-left leading-relaxed font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  Transform your bio into a powerful analytics hub. See which links your audience loves, track real-time engagement, and optimize for maximum growth.
                </motion.p>
                
                {/* Trust indicators */}
                <motion.div 
                  className="flex items-center justify-center md:justify-start gap-6 text-sm text-gray-500 font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>100% Free Forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Privacy First</span>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                      className="flex flex-col md:flex-row gap-4 pt-6 justify-center md:justify-start w-full md:max-w-lg md:mx-0 items-stretch md:items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group w-full md:w-1/2 flex items-center"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <button className="relative w-full md:w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white font-semibold px-7 py-[15px] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 text-xl min-h-[52px] align-middle">
                          <Link to={session ? '/dashboard' : '/getstarted'} className="flex items-center gap-2 w-full justify-center align-middle">
                            <span className="align-middle">{session ? 'Visit Dashboard' : 'Start Tracking Free'}</span>
                            <svg className="w-5 h-5 align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        </button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full md:w-1/2 flex items-center"
                      >
                        <button className="w-full md:w-full flex border-2 border-gray-200 bg-white/90 backdrop-blur-sm items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg text-gray-700 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-300 text-lg min-h-[48px] align-middle">
                          <span className="align-middle">Watch Demo</span>
                          <div className="flex justify-center items-center bg-gradient-to-r from-indigo-100 to-purple-100 w-8 h-8 rounded-full text-indigo-600 group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300 align-middle">
                            <svg className="w-4 h-4 align-middle" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </button>
                      </motion.div>
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