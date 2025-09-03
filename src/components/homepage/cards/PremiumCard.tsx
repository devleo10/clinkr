
import { motion } from 'framer-motion';

const PremiumCard = () => {
  return (
    <motion.div 
      className="w-full relative bg-white backdrop-blur-xl border-2 border-orange-500 p-8 rounded-3xl hover:border-orange-600 flex flex-col justify-between shadow-2xl hover:shadow-3xl group transition-all duration-500 overflow-hidden"
      whileHover={{ y: -12, scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white opacity-95 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-10 left-4 w-20 h-20 bg-white rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
      
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-t-3xl" />
      
      {/* Corner decoration */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-tl-full bg-white" />
      </div>

      {/* Animated floating icons */}
      <div className="absolute top-6 right-6 opacity-25 group-hover:opacity-40 transition-opacity duration-500">
        <div className="w-8 h-8 rounded-full bg-white animate-bounce shadow-lg" style={{ animationDelay: '0.5s' }} />
      </div>
      
      <div className="absolute top-16 right-10 opacity-15 group-hover:opacity-25 transition-opacity duration-700">
        <div className="w-4 h-4 rounded-full bg-white animate-bounce" style={{ animationDelay: '1s' }} />
      </div>      {/* Pricing content */}
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-black">Premium</h3>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500 line-through">$14.99</span>
              <span className="text-4xl font-bold text-black">
                $9.99
              </span>
              <span className="text-sm text-black">/ month</span>
            </div>
          </div>
          <p className="text-black text-lg font-medium">For power users who need advanced analytics and unlimited links</p>
        </div>

        {/* Features list */}
        <div className="space-y-4">
          {[
            'Unlimited custom links',
            'Advanced analytics & insights',
            'Custom domains',
            'QR code generation',
            'Link expiration dates',
            'Team collaboration',
            'API access',
            'Priority support'
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-black font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button 
          className="w-full relative bg-white hover:bg-gray-50 text-black font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="shiny-effect"></div>
          <span className="relative z-10">Get Premium Access</span>
        </motion.button>
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