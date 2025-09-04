import { motion } from "framer-motion";

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
    {/* Modern orbital loader */}
    <div className="relative mb-8">
      {/* Outer ring */}
      <motion.div
        className="w-20 h-20 rounded-full border-2 border-orange-100"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
      
      {/* Middle ring */}
      <motion.div
        className="absolute top-1 left-1 w-18 h-18 rounded-full border-2 border-orange-300"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
      
      {/* Inner ring with gradient */}
      <motion.div
        className="absolute top-2 left-2 w-16 h-16 rounded-full border-4 border-transparent bg-gradient-to-r from-orange-500 to-orange-600 p-[2px]"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      >
        <div className="w-full h-full rounded-full bg-white" />
      </motion.div>
      
      {/* Center dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
      />
      
      {/* Orbiting particles */}
      {[0, 60, 120, 180, 240, 300].map((index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 bg-orange-400 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transformOrigin: '0 0',
          }}
          animate={{
            rotate: 360,
            x: [0, 35, 0, -35, 0],
            y: [0, 35, 0, -35, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2 + index * 0.1,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>

    {/* Modern text with typing effect */}
    <motion.div
      className="text-2xl font-semibold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent tracking-wide"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        Loading
      </motion.span>
      <motion.span
        className="inline-block ml-1"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
      >
        ...
      </motion.span>
    </motion.div>

    {/* Progress bar */}
    <div className="w-48 h-1 bg-orange-100 rounded-full mt-6 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      />
    </div>
  </div>
);

export default LoadingScreen;