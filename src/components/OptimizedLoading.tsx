import React from 'react';
import { motion } from 'framer-motion';

interface OptimizedLoadingProps {
  compact?: boolean;
  message?: string;
  className?: string;
}

const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({ 
  compact = false, 
  message = 'Loading...',
  className = ''
}) => {
  const containerClass = compact 
    ? 'flex items-center justify-center p-4'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <motion.div 
      className={`${containerClass} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        {/* Spinning ring with orange styling */}
        <motion.div
          className="w-8 h-8 border-3 border-orange-200 border-t-orange-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        
        {/* Pulse effect with orange styling */}
        <motion.div
          className="absolute inset-0 w-8 h-8 border-3 border-orange-300 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {!compact && (
        <motion.p 
          className="mt-4 text-lg lg:text-xl leading-relaxed font-medium text-gray-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};

export default OptimizedLoading;
