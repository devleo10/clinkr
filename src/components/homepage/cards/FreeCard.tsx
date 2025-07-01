import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FreeCard = () => {
  return (
    <motion.div 
      className="w-full bg-white/70 backdrop-blur-md border border-white/40 p-6 rounded-xl hover:border-indigo-200 flex flex-col justify-between shadow-lg hover:shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
    >
        <div>
          <div className="flex flex-row justify-between">
              <div>
                  <p className="text-2xl md:text-4xl font-bold">Free</p>
                  <p className="text-gray-600 text-sm">Perfect to get started</p>
              </div>
              <div>
                  <p className="text-2xl md:text-4xl font-bold">$0</p>
                  <p className="text-gray-600 text-sm">Forever free</p>
              </div>
          </div>
          <div className="mt-8 space-y-4">
              <p className="text-sm">✅ Click Tracking</p>
              <p className="text-sm">✅ Basic Analytics</p>
              <p className="text-sm">✅ Up to 5 links</p>
          </div>
        </div>
        <div className="w-full mb-8 mt-5">
            <Link to="/signup" className="block">
                <motion.button 
                  className="text-md py-2.5 px-4 w-full transition-all duration-300 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                    Get Started
                </motion.button>
            </Link>
        </div>
    </motion.div>
  )
}

export default FreeCard