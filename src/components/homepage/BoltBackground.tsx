
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const BoltBackground = () => {
  const [isVisible, setIsVisible] = useState(true);

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
      
      {/* Animated floating elements - only when tab is visible */}
      {isVisible && (
        <>
          <motion.div 
            className="absolute w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(255, 122, 26, 0.15) 0%, rgba(255, 122, 26, 0.05) 40%, transparent 70%)',
              left: '10%',
              top: '10%',
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 10, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute w-[500px] h-[500px] rounded-full opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(255, 122, 26, 0.08) 0%, rgba(255, 122, 26, 0.02) 40%, transparent 70%)',
              right: '15%',
              top: '20%',
              filter: 'blur(70px)',
            }}
            animate={{
              x: [0, -25, 15, 0],
              y: [0, 25, -15, 0],
              scale: [1, 0.8, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
          />
          
          <motion.div 
            className="absolute w-[400px] h-[400px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(255, 122, 26, 0.06) 0%, rgba(255, 122, 26, 0.01) 40%, transparent 70%)',
              left: '60%',
              bottom: '20%',
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, 20, -30, 0],
              y: [0, -15, 20, 0],
              scale: [1, 1.3, 0.7, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 10
            }}
          />
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
