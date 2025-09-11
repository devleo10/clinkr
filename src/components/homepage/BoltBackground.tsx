
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import usePerformanceOptimization from '../../hooks/usePerformanceOptimization';

const BoltBackground = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { disableBackgroundEffects, simplifiedAnimations } = usePerformanceOptimization();

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Modern gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Conditional animated floating elements based on performance */}
      {isVisible && !disableBackgroundEffects && (
        <>
          <motion.div 
            className="absolute w-[400px] h-[400px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(255, 122, 26, 0.1) 0%, rgba(255, 122, 26, 0.03) 40%, transparent 70%)',
              left: '10%',
              top: '10%',
              filter: 'blur(60px)',
            }}
            animate={simplifiedAnimations ? {} : {
              x: [0, 20, -15, 0],
              y: [0, -15, 10, 0],
              scale: [1, 1.05, 0.95, 1],
            }}
            transition={simplifiedAnimations ? {} : {
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {!simplifiedAnimations && (
            <motion.div 
              className="absolute w-[300px] h-[300px] rounded-full opacity-15"
              style={{
                background: 'radial-gradient(circle, rgba(255, 122, 26, 0.08) 0%, rgba(255, 122, 26, 0.02) 40%, transparent 70%)',
                right: '15%',
                top: '20%',
                filter: 'blur(50px)',
              }}
              animate={{
                x: [0, -20, 10, 0],
                y: [0, 20, -10, 0],
                scale: [1, 0.9, 1.1, 1],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 8
              }}
            />
          )}
        </>
      )}
      
      {/* Static elements that don't need animation */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--c-text) 1px, transparent 1px),
            linear-gradient(to bottom, var(--c-text) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-mode-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default BoltBackground;
