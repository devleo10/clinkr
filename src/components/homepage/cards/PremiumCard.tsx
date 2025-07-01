import { motion } from 'framer-motion';

const PremiumCard = () => {
  return (
    <motion.div 
      className="w-full bg-white/70 backdrop-blur-md border border-indigo-100 p-6 rounded-xl hover:border-indigo-300 flex flex-col justify-between shadow-lg hover:shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.15), 0 10px 10px -5px rgba(79, 70, 229, 0.1)"
      }}
    >
        <div>
          <div className="flex flex-row justify-between">
              <div>
                  <p className="text-2xl md:text-4xl font-bold">Premium</p>
                  <p className="text-gray-600 text-sm">For serious track of links</p>
              </div>
              <div>
                  <p className="text-2xl md:text-4xl font-bold">$2.99</p>
                  <p className="text-gray-600 text-sm">Per Month</p>
              </div>
          </div>
          <div className="mt-8 space-y-4">
              <p className="text-sm">✅ Everything in Free</p>
              <p className="text-sm">✅ Geo heatmaps</p>
              <p className="text-sm">✅ Device analytics</p>
              <p className="text-sm">✅ CSV exports</p>
              <p className="text-sm">✅ Unlimited links</p>
          </div>
        </div>
        <motion.div 
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold px-6 py-2.5 rounded-lg shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 mt-6 flex justify-center items-center"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.2)"
          }}
          whileTap={{ scale: 0.98 }}
        >
            <button>
                Upgrade to premium
            </button>
        </motion.div>
    </motion.div>
  )
}

export default PremiumCard