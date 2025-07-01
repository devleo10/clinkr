import { motion } from "framer-motion";

const Upgrade = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className='w-full h-auto min-h-20 mb-10 md:mb-20 px-6 md:px-10 py-6 md:py-0'
    >
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white p-8 rounded-xl shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        <div className="z-10 text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-2xl font-bold text-white">Unlock Advanced Analytics</h2>
          <p className="mt-2 text-white/90">Get deeper insights, exclusive features, and priority support with Premium.</p>
        </div>
        <motion.button 
          className="bg-white text-indigo-600 font-semibold py-3 px-6 rounded-xl hover:bg-indigo-50 transition-colors duration-300 shadow-md z-10 border border-white/30"
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          Upgrade Now
        </motion.button>
        
        {/* Background elements */}
        <motion.div 
          className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Animated accent line */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1 bg-white/30"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        
        {/* Shiny effect */}
        <div className="shiny-effect"></div>
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
  );
}

export default Upgrade;
