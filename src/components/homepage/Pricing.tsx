import FreeCard from "./cards/FreeCard"
import PremiumCard from "./cards/PremiumCard"
import { motion } from 'framer-motion';


const Pricing = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center relative">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-transparent to-amber-50/30 rounded-2xl"
      />
      <div 
        className="flex flex-col justify-center items-center text-center mb-12 relative z-10"
      >
        <h1 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 drop-shadow-sm tracking-tight mb-3">Choose Your Perfect Plan</h1>
        <p className="text-gray-800 text-base font-semibold">Start Free, Upgrade when you need more</p>
      </div>
      
      {/* Simplified background floating orbs */}
      <motion.div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <motion.div
          className="absolute w-32 h-32 rounded-full"
          style={{ left: '6%', top: '8%', filter: 'blur(40px)', background: 'radial-gradient(circle, rgba(255,144,81,0.12) 0%, rgba(255,144,81,0.02) 50%, transparent 70%)' }}
          animate={{ x: [0, 20, -15, 0], y: [0, -15, 8, 0], scale: [1, 1.05, 0.95, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Cards container - column on small screens, row on md and up */}
      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-4xl w-full relative z-10">
        <FreeCard />
        <PremiumCard />
      </div>
    </div>
  )
}

export default Pricing