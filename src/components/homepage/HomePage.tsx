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
          <div className="flex flex-col w-full md:flex-row items-center justify-between py-16 gap-16">
            {/* Right Container - Phone Animation moved to left */}
            <motion.div 
              className="flex-1 relative h-[650px] order-2 md:order-1"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <PhoneAnimation />
            </motion.div>
            
            {/* Left Container - Hero text moved to right with creative positioning */}
            <motion.div 
              className="flex-1 space-y-10 order-1 md:order-2 text-center md:text-right max-w-2xl relative"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Decorative element */}
              <motion.div 
                className="absolute -top-8 -right-4 w-24 h-24 bg-gradient-to-br from-orange-200/40 to-amber-300/30 rounded-full blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <div className="space-y-8">
                <div className="text-6xl md:text-8xl font-black max-w-full overflow-hidden leading-[0.9] tracking-tight">
                  <motion.div 
                    className="flex flex-col items-center md:items-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.span 
                      className="block w-full text-center md:text-right text-gray-900"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    >
                      Track Every
                    </motion.span>
                    <motion.span 
                      className="block w-full text-center md:text-right bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      Click & Link
                    </motion.span>
                    <motion.div
                      className="flex items-center gap-4 text-center md:text-right justify-center md:justify-end"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    >
                      <span className="text-gray-700 font-bold">With</span>
                      <div className="relative">
                        <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-black">
                          Zero Cost
                        </span>
                        <motion.div
                          className="absolute -bottom-3 left-0 w-full h-2.5 bg-gradient-to-r from-emerald-300/60 to-cyan-300/60 rounded-full"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 1.2, duration: 1 }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
                <motion.p 
                  className="text-xl text-gray-600 text-center md:text-right leading-relaxed font-medium max-w-lg md:ml-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  Transform your bio into a powerful analytics hub. See which links your audience loves, track real-time engagement, and optimize for maximum growth.
                </motion.p>
                
                {/* Trust indicators */}
                <motion.div 
                  className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-sm text-gray-500 font-medium"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>100% Free Forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                    <span>Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
                    <span>Privacy First</span>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                      className="flex flex-col md:flex-row gap-5 pt-8 justify-center md:justify-end w-full items-stretch md:items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.8 }}
              >
                
                      <motion.div
                        whileHover={{ scale: 1.06, y: -3 }}
                        whileTap={{ scale: 0.96 }}
                        className="relative group w-full md:w-auto flex items-center"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-80 transition duration-1000 group-hover:duration-200"></div>
                        <button className="relative w-full md:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg min-h-[56px]">
                          <Link to={session ? '/dashboard' : '/getstarted'} className="flex items-center gap-3 w-full justify-center">
                            <span>{session ? 'Visit Dashboard' : 'Start Tracking Free'}</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        </button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full md:w-auto flex items-center"
                      >
                        <button className="w-full md:w-auto flex border-2 border-orange-200/70 bg-white/95 backdrop-blur-sm items-center justify-center gap-3 px-7 py-4 rounded-xl font-semibold shadow-lg text-gray-700 hover:border-orange-300 hover:text-orange-700 transition-all duration-300 text-lg min-h-[52px]">
                          <span>Watch Demo</span>
                          <div className="flex justify-center items-center bg-gradient-to-r from-orange-100 to-amber-100 w-8 h-8 rounded-full text-orange-600 transition-all duration-300">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </button>
                      </motion.div>
              </motion.div>
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