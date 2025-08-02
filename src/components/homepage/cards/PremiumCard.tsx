

import { motion } from 'framer-motion';

const PremiumCard = () => {
  return (
    <motion.div 
      className="w-full relative bg-white/95 backdrop-blur-xl border-2 border-indigo-200/80 p-8 rounded-3xl hover:border-indigo-300 flex flex-col justify-between shadow-2xl hover:shadow-3xl group transition-all duration-500 overflow-hidden"
      whileHover={{ y: -12, scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/80 to-blue-50/90 opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-10 left-4 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
      
      {/* Enhanced top accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 rounded-t-3xl" />
      
      {/* Corner decoration */}
      <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-purple-500 to-indigo-500" />
      </div>
      
      {/* Premium badge */}
      <div className="absolute -top-4 left-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          🔥 MOST POPULAR
        </div>
      </div>
      
      {/* Enhanced shiny effect */}
      <div className="shiny-effect"></div>
      
      <div className="relative z-10">
        <div>
          <div className="flex flex-row justify-between items-start mb-8 mt-6">
              <div>
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Premium</h3>
                  <p className="text-gray-600 text-sm font-semibold">For serious link tracking</p>
              </div>
              <div className="text-right">
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">$2.99</div>
                  <p className="text-gray-600 text-sm font-semibold">Per Month</p>
              </div>
          </div>
          
          <div className="space-y-5">
              {[
                "Everything in Free",
                "Geo heatmaps", 
                "Device analytics",
                "CSV exports",
                "Unlimited links",
                "Priority support"
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
          <motion.div
            className="relative group/button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 rounded-2xl blur opacity-25 group-hover/button:opacity-75 transition duration-1000 group-hover/button:duration-200"></div>
            <button 
              className="relative w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-6 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex justify-center items-center gap-3 text-lg border-2 border-transparent hover:border-white/20"
            >
                <span>Upgrade to Premium</span>
                <svg className="w-5 h-5 group-hover/button:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </button>
          </motion.div>
        </div>
      </div>
      
      <style>{`
        .shiny-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: skewX(-30deg);
          animation: shiny 6s infinite;
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