import { motion } from "framer-motion";

type Props = {
  compact?: boolean;
  message?: string;
};

const LoadingScreen = ({ compact = false, message = 'Loading' }: Props) => {
  if (compact) {
    // Compact inline spinner (small orbital rings)
    return (
      <div className="inline-flex items-center gap-3">
        <div className="relative w-8 h-8">
          <motion.span className="block w-8 h-8 rounded-full border-2 border-[rgba(255,153,102,0.18)]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
          />
          <motion.span className="absolute inset-0 block w-8 h-8 rounded-full border-2 border-[rgba(255,153,102,0.32)]"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
          />
          <motion.span className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        </div>
        <div className="text-sm font-medium text-[rgba(var(--foreground),0.9)]">
          {message ? `${message}...` : 'Loading...'}
        </div>
      </div>
    );
  }

  // Full-screen, centered overlay loader with enhanced cool animations and instant positioning
  return (
    <motion.div 
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-orange-50/95 via-amber-50/90 to-orange-100/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {/* Floating background particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-orange-300/40 rounded-full"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + i * 0.3,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
      
      <motion.div 
        className="flex flex-col items-center justify-center space-y-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Enhanced orbital loader */}
        <div className="relative w-32 h-32">
          {/* Glowing outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-orange-200 shadow-lg"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.3))',
            }}
          />

          {/* Pulsing middle ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-3 border-orange-400"
            animate={{ 
              rotate: -360,
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 2.8, ease: 'linear' },
              scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
            }}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(251, 146, 60, 0.4))',
            }}
          />

          {/* Enhanced inner gradient ring */}
          <motion.div
            className="absolute inset-8 rounded-full border-4 border-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-[3px]"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 1.8, ease: 'linear' },
              scale: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
            }}
          >
            <div className="w-full h-full rounded-full bg-white/95 shadow-inner" />
          </motion.div>

          {/* Central pulsing dot */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            animate={{ 
              scale: [1, 1.8, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(251, 146, 60, 0.6))',
            }}
          />

          {/* Enhanced orbiting particles with trails */}
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <motion.div
              key={deg}
              className="absolute w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
              style={{ 
                top: '50%', 
                left: '50%', 
                transformOrigin: '0 0',
                filter: 'drop-shadow(0 0 3px rgba(251, 146, 60, 0.8))',
              }}
              animate={{
                rotate: 360,
                x: [0, 54, 0, -54, 0],
                y: [0, 54, 0, -54, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.5 + i * 0.15, 
                ease: 'easeInOut', 
                delay: i * 0.1 
              }}
            />
          ))}

          {/* Additional spinning elements */}
          {[0, 120, 240].map((deg, i) => (
            <motion.div
              key={`secondary-${deg}`}
              className="absolute w-1.5 h-1.5 bg-amber-300 rounded-full"
              style={{ 
                top: '50%', 
                left: '50%', 
                transformOrigin: '0 0',
              }}
              animate={{
                rotate: -360,
                x: [0, -35, 0, 35, 0],
                y: [0, -35, 0, 35, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3.2 + i * 0.2, 
                ease: 'easeInOut', 
                delay: i * 0.15 
              }}
            />
          ))}
        </div>

        {/* Enhanced text with glow effect */}
        <motion.div 
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 relative"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.3))',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            {message}
          </motion.div>
          {message}
          <motion.span 
            className="ml-2" 
            animate={{ opacity: [0, 1, 0] }} 
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            ...
          </motion.span>
        </motion.div>

        {/* Enhanced progress bar with glow */}
        <div className="w-64 h-2 bg-orange-100 rounded-full overflow-hidden shadow-inner relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full relative"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(251, 146, 60, 0.6))',
            }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;