import React from 'react';
import { motion } from 'framer-motion';

const ProfileBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Main gradient background - darker tone */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 opacity-80"></div>
      
      {/* Animated accent circles */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400 mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.2, 0.15],
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
        className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-purple-400 mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.1, 0.15],
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Additional animated glowing orbs */}
      <motion.div 
        className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-indigo-400 mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.12, 0.18, 0.12],
          x: [0, 40, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Animated top-right accent */}
      <motion.div 
        className="absolute top-0 right-0 w-80 h-80 rounded-bl-full bg-gradient-to-br from-indigo-400/40 to-purple-400/40 filter blur-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 0.5, 
          scale: 1,
          rotate: [0, 5, 0],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Bottom-left accent */}
      <motion.div 
        className="absolute bottom-0 left-0 w-96 h-96 rounded-tr-full bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 filter blur-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 0.4, 
          scale: [1, 1.1, 1],
          rotate: [0, -3, 0],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Beautiful rainbow gradient ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-[120%] h-[120%] rounded-full opacity-5"
          style={{
            background: 'conic-gradient(from 0deg, #ff6b6b, #ffb86c, #fdfd88, #98fb98, #88bdfd, #c780e8, #ff6b6b)',
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
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 animate-grid"></div>
      
      {/* Enhanced particle effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 80 }).map((_, index) => (
          <motion.div 
            key={index}
            className={`absolute rounded-full ${
              index % 5 === 0 ? 'bg-blue-300' : 
              index % 5 === 1 ? 'bg-indigo-300' : 
              index % 5 === 2 ? 'bg-purple-300' : 
              index % 5 === 3 ? 'bg-pink-300' : 'bg-cyan-300'
            }`}
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3
            }}
            animate={{
              y: [0, -60 - Math.random() * 40],
              x: [0, (Math.random() - 0.5) * 40],
              opacity: [0.7, 0],
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
      
      {/* Prismatic light rays */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.div
            key={`ray-${index}`}
            className="absolute origin-center"
            style={{
              top: '50%',
              left: '50%',
              width: '300%',
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${
                index % 4 === 0 ? 'rgba(147, 197, 253, 0.15)' : 
                index % 4 === 1 ? 'rgba(196, 181, 253, 0.15)' : 
                index % 4 === 2 ? 'rgba(251, 207, 232, 0.15)' : 
                'rgba(167, 243, 208, 0.15)'
              }, transparent)`,
              rotate: `${(index * 22.5)}deg`,
              transformOrigin: 'center',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
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
      
      {/* Subtle glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-[60px] bg-white/10"></div>
    </div>
  );
};

export default ProfileBackground;
