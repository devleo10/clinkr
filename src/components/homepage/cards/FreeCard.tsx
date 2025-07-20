import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FreeCard = () => {
  return (
    <motion.div 
      className="w-full glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl hover:border-indigo-200 flex flex-col justify-between shadow-lg hover:shadow-xl relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-70" />
      
      {/* Animated accent line */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      
      {/* Animated corner decoration */}
      <motion.div
        className="absolute bottom-0 right-0 w-16 h-16 opacity-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-gray-400 to-gray-600" />
      </motion.div>
      
      <div className="relative z-10">
        <div>
          <div className="flex flex-row justify-between">
              <div>
                  <p className="text-2xl md:text-4xl font-bold text-gray-800">Free</p>
                  <p className="text-gray-600 text-sm font-medium">Perfect to get started</p>
              </div>
              <div>
                  <p className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-800">$0</p>
                  <p className="text-gray-600 text-sm font-medium">Forever free</p>
              </div>
          </div>
          <div className="mt-8 space-y-4">
              <p className="text-sm font-medium flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-700">Click Tracking</span>
              </p>
              <p className="text-sm font-medium flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-700">Basic Analytics</span>
              </p>
              <p className="text-sm font-medium flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-700">Up to 5 links</span>
              </p>
          </div>
        </div>
        <div className="w-full mb-8 mt-5">
            <Link to="/signup" className="block">
                <motion.button 
                  className="text-md py-2.5 px-4 w-full transition-all duration-300 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                    Get Started
                </motion.button>
            </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default FreeCard