import React from 'react';
import { motion } from 'framer-motion';

interface PublicProfileBackgroundProps {
  variant?: 'light' | 'standard';
}

const PublicProfileBackground: React.FC<PublicProfileBackgroundProps> = ({ variant = 'light' }) => {
  const isLight = variant === 'light';
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Main gradient background - ultra light and airy */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        isLight 
          ? 'from-white via-blue-50/30 to-indigo-50/30' 
          : 'from-indigo-50 via-blue-50 to-purple-50'
      } opacity-90`}></div>
      
      {/* Animated accent circles - lighter, more subtle */}
      <motion.div 
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full ${
          isLight ? 'bg-blue-100' : 'bg-blue-200'
        } mix-blend-multiply filter blur-3xl ${
          isLight ? 'opacity-10' : 'opacity-20'
        }`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: isLight ? [0.08, 0.12, 0.08] : [0.15, 0.2, 0.15],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      <motion.div 
        className={`absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full ${
          isLight ? 'bg-purple-100' : 'bg-purple-200'
        } mix-blend-multiply filter blur-3xl ${
          isLight ? 'opacity-10' : 'opacity-20'
        }`}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: isLight ? [0.08, 0.05, 0.08] : [0.15, 0.1, 0.15],
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Additional animated glowing orbs - lighter */}
      <motion.div 
        className={`absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full ${
          isLight ? 'bg-indigo-100' : 'bg-indigo-200'
        } mix-blend-multiply filter blur-3xl ${
          isLight ? 'opacity-10' : 'opacity-20'
        }`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: isLight ? [0.06, 0.09, 0.06] : [0.12, 0.18, 0.12],
          x: [0, 40, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Animated top-right accent - lighter */}
      <motion.div 
        className={`absolute top-0 right-0 w-80 h-80 rounded-bl-full ${
          isLight 
            ? 'bg-gradient-to-br from-indigo-100/30 to-purple-100/30' 
            : 'bg-gradient-to-br from-indigo-200/40 to-purple-200/40'
        } filter blur-xl`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isLight ? 0.3 : 0.5, 
          scale: 1,
          rotate: [0, 5, 0],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Bottom-left accent - lighter */}
      <motion.div 
        className={`absolute bottom-0 left-0 w-96 h-96 rounded-tr-full ${
          isLight 
            ? 'bg-gradient-to-tr from-blue-100/20 to-indigo-100/20' 
            : 'bg-gradient-to-tr from-blue-200/30 to-indigo-200/30'
        } filter blur-xl`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isLight ? 0.25 : 0.4, 
          scale: [1, 1.1, 1],
          rotate: [0, -3, 0],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Beautiful rainbow gradient ring - very subtle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className={`w-[120%] h-[120%] rounded-full ${
            isLight ? 'opacity-3' : 'opacity-5'
          }`}
          style={{
            background: isLight 
              ? 'conic-gradient(from 0deg, #ff6b6b33, #ffb86c33, #fdfd8833, #98fb9833, #88bdfd33, #c780e833, #ff6b6b33)'
              : 'conic-gradient(from 0deg, #ff6b6b, #ffb86c, #fdfd88, #98fb98, #88bdfd, #c780e8, #ff6b6b)',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      {/* Grid pattern - very subtle */}
      <div className={`absolute inset-0 bg-grid-pattern ${
        isLight ? 'opacity-3' : 'opacity-5'
      } animate-grid`}></div>
      
      {/* Enhanced particle effect - fewer, more subtle particles */}
      <div className="absolute inset-0">
        {Array.from({ length: isLight ? 40 : 80 }).map((_, index) => (
          <motion.div 
            key={index}
            className={`absolute rounded-full ${
              index % 5 === 0 ? (isLight ? 'bg-blue-200' : 'bg-blue-300') : 
              index % 5 === 1 ? (isLight ? 'bg-indigo-200' : 'bg-indigo-300') : 
              index % 5 === 2 ? (isLight ? 'bg-purple-200' : 'bg-purple-300') : 
              index % 5 === 3 ? (isLight ? 'bg-pink-200' : 'bg-pink-300') : 
              (isLight ? 'bg-cyan-200' : 'bg-cyan-300')
            }`}
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: isLight ? Math.random() * 0.3 + 0.2 : Math.random() * 0.5 + 0.3
            }}
            animate={{
              y: [0, -60 - Math.random() * 40],
              x: [0, (Math.random() - 0.5) * 40],
              opacity: [isLight ? 0.5 : 0.7, 0],
              scale: [1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 20
            }}
          ></motion.div>
        ))}
      </div>
      
      {/* Prismatic light rays - fewer, more subtle */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: isLight ? 4 : 8 }).map((_, index) => (
          <motion.div
            key={`ray-${index}`}
            className="absolute origin-center"
            style={{
              top: '50%',
              left: '50%',
              width: '300%',
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${
                index % 4 === 0 ? `rgba(147, 197, 253, ${isLight ? '0.08' : '0.15'})` : 
                index % 4 === 1 ? `rgba(196, 181, 253, ${isLight ? '0.08' : '0.15'})` : 
                index % 4 === 2 ? `rgba(251, 207, 232, ${isLight ? '0.08' : '0.15'})` : 
                `rgba(167, 243, 208, ${isLight ? '0.08' : '0.15'})`
              }, transparent)`,
              rotate: `${(index * (isLight ? 45 : 22.5))}deg`,
              transformOrigin: 'center',
            }}
            animate={{
              opacity: isLight ? [0.15, 0.3, 0.15] : [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + index % 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5
            }}
          />
        ))}
      </div>
      
      {/* Subtle glassmorphism overlay - lighter */}
      <div className={`absolute inset-0 backdrop-blur-[${isLight ? '40px' : '60px'}] bg-white/${isLight ? '5' : '10'}`}></div>
    </div>
  );
};

export default PublicProfileBackground;
