import { motion } from 'framer-motion';

const PremiumCard = () => {
  return (
    <motion.div 
      className="w-full glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl hover:border-indigo-300 flex flex-col justify-between shadow-lg hover:shadow-xl relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.2)"
      }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
      
      {/* Animated accent line */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      
      {/* Animated corner decoration */}
      <motion.div
        className="absolute bottom-0 right-0 w-16 h-16 opacity-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-purple-500 to-indigo-500" />
      </motion.div>
      
      {/* Shiny effect */}
      <div className="shiny-effect"></div>
      
      <div className="relative z-10">
        <div>
          <div className="flex flex-row justify-between">
              <div>
                  <p className="text-2xl md:text-4xl font-bold text-gray-800">Premium</p>
                  <p className="text-gray-600 text-sm font-medium">For serious track of links</p>
              </div>
              <div>
                  <p className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">$2.99</p>
                  <p className="text-gray-600 text-sm font-medium">Per Month</p>
              </div>
          </div>
          <div className="mt-8 space-y-4">
              <p className="text-sm font-medium flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-700">Everything in Free</span>
              </p>
              <p className="text-sm font-medium flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-700">Geo heatmaps</span>
              </p>
              <p className="text-sm font-medium flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-700">Device analytics</span>
              </p>
              <p className="text-sm font-medium flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-700">CSV exports</span>
              </p>
              <p className="text-sm font-medium flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-700">Unlimited links</span>
              </p>
          </div>
        </div>
        <motion.div 
          className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-6 py-2.5 rounded-lg shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 mt-6 flex justify-center items-center relative overflow-hidden"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.4), 0 4px 6px -2px rgba(99, 102, 241, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
        >
            <button>
                Upgrade to premium
            </button>
        </motion.div>
      </div>
      
      <style>{`
        .shiny-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: skewX(-30deg);
          animation: shiny 5s infinite;
        }

        @keyframes shiny {
          0% {
            left: -100%;
          }
          20%, 100% {
            left: 100%;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default PremiumCard