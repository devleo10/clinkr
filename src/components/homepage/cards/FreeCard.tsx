import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FreeCard = () => {
  return (
    <motion.div 
      className="w-full relative bg-white/95 backdrop-blur-xl border-2 border-orange-200/70 p-8 rounded-3xl hover:border-orange-300 flex flex-col justify-between shadow-2xl hover:shadow-3xl group transition-all duration-500 overflow-hidden"
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-t-3xl" />
      
      {/* Corner decoration */}
      <div className="absolute bottom-0 right-0 w-20 h-20 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-tl-full bg-white" />
      </div>
      
      <div className="relative z-10">
        <div>
          <div className="flex flex-row justify-between items-start mb-8">
              <div>
                  <h3 className="text-3xl md:text-4xl font-black text-black mb-2">Free</h3>
                  <p className="text-gray-600 text-sm font-semibold">Perfect to get started</p>
              </div>
              <div className="text-right">
                  <div className="text-4xl md:text-5xl font-black text-black">$0</div>
                  <span className="text-sm text-black font-medium">Forever Free</span>
              </div>
          </div>
          
          <div className="space-y-5">
              {[
                "Click Tracking",
                "Basic Analytics", 
                "Up to 5 links",
                "Real-time Dashboard"
              ].map((feature, index) => (
                <motion.div 
                  key={feature}
                  className="flex items-center group-hover:translate-x-1 transition-transform duration-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full mr-4 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800 font-semibold">{feature}</span>
                </motion.div>
              ))}
          </div>
        </div>
        
        <div className="w-full mt-10">
            <Link to="/signup" className="block">
                <motion.button 
                  className="text-lg py-4 px-6 w-full transition-all duration-300 bg-white hover:bg-gray-50 text-black rounded-2xl font-bold shadow-xl hover:shadow-2xl border-2 border-gray-200 hover:border-gray-300 group/button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                    <span className="flex items-center justify-center gap-2">
                      Get Started Free
                      <svg className="w-5 h-5 group-hover/button:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                </motion.button>
            </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default FreeCard;