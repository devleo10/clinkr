import { motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import Navbar from './Navbar';
import { Link, Route, Routes } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import Footer from './Footer';
import About from './About';
import BoltBackground from './BoltBackground';
import LoadingScreen from '../ui/loadingScreen';
import ScreenshotCarousel from './ScreenshotCarousel';

// Lazy load heavy homepage sections for better performance
const Pricing = lazy(() => import('./Pricing'));
const FAQ = lazy(() => import('./FAQ'));
const Features = lazy(() => import('./Features'));

const HomePage = () => {
  const { session, hasProfile } = useAuth();

  // Determine if user should see dashboard or get started
  const shouldShowDashboard = session && hasProfile;

  return (
    <div className="relative overflow-hidden min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <BoltBackground />
      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/about" element={<About />} />
        </Routes>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full">
          <div className="flex flex-col w-full lg:flex-row items-center justify-between py-20 lg:py-32 gap-16 lg:gap-24">
            {/* Left Container - Hero text */}
            <motion.div 
              className="flex-1 order-2 lg:order-1 text-center lg:text-left max-w-2xl relative"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Floating accent - REMOVED */}
              
              <div className="space-y-8">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div 
                      className="text-black font-extrabold"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    >
                      Smart Link
                    </motion.div>
                    <motion.div 
                      className="text-black font-extrabold"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                    >
                      Analytics
                    </motion.div>
                    <motion.div 
                      className="font-extrabold text-black"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                    >
                      Made Simple
                    </motion.div>
                  </motion.div>
                </div>
                
                <motion.p 
                  className="text-lg lg:text-xl leading-relaxed font-medium max-w-lg mx-auto lg:mx-0 text-gray-700"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  Track every click, understand your audience, and optimize your content strategy with powerful, real-time analytics.
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-12 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to={shouldShowDashboard ? '/dashboard' : '/getstarted'}
                    className="btn-primary inline-flex items-center gap-3 text-base font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span>Get Started Free</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button className="btn-secondary inline-flex items-center gap-3 text-base font-semibold px-8 py-4 rounded-xl">
                    <div className="flex justify-center items-center w-6 h-6 rounded-full bg-current/10">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <span>Watch Demo</span>
                  </button>
                </motion.div>
              </motion.div>
              
              {/* Trust indicators */}
              <motion.div 
                className="flex items-center gap-6 pt-8 justify-center lg:justify-start text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ED7B00' }}></div>
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ED7B00' }}></div>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ED7B00' }}></div>
                  <span>Real-time analytics</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Container - Screenshot Carousel */}
            <motion.div 
              className="flex-1 relative order-1 lg:order-2 w-full lg:w-auto"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <ScreenshotCarousel />
            </motion.div>
          </div>
          
          {/* Features Section */}
          <div className="relative z-10 py-20">
            <Suspense fallback={<LoadingScreen compact />}>
              <Features />
            </Suspense>
          </div>
          
          {/* Pricing Section */}
          <div id="pricing" className="relative z-10 py-20">
            <Suspense fallback={<LoadingScreen compact />}>
              <Pricing />
            </Suspense>
          </div>
          
          {/* FAQ Section */}
          <div id="faq" className="relative z-10 py-20">
            <Suspense fallback={<LoadingScreen compact />}>
              <FAQ />
            </Suspense>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;