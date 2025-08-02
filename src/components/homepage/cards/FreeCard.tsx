import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FreeCard = () => {
  return (
    <motion.div 
      className="w-full relative bg-white/95 backdrop-blur-xl border-2 border-gray-200/80 p-8 rounded-3xl hover:border-gray-300 flex flex-col justify-between shadow-2xl hover:shadow-3xl group transition-all duration-500 overflow-hidden"
      whileHover={{ y: -8, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50/80 opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-gray-300/20 to-gray-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800 rounded-t-3xl" />
      
      {/* Corner decoration */}
      <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-gray-500 to-gray-800" />
      </div>
      
      <div className="relative z-10">
        <div>
          <div className="flex flex-row justify-between items-start mb-8">
              <div>
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Free</h3>
                  <p className="text-gray-600 text-sm font-semibold">Perfect to get started</p>
              </div>
              <div className="text-right">
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">$0</div>
                  <p className="text-gray-600 text-sm font-semibold">Forever free</p>
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
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 mr-4 shadow-lg">
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
                  className="text-lg py-4 px-6 w-full transition-all duration-300 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 rounded-2xl font-bold shadow-xl hover:shadow-2xl border-2 border-gray-200 hover:border-gray-300 group/button"
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
  )
}

export default FreeCard