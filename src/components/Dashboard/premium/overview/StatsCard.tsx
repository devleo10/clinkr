import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isNegative?: boolean;
  icon: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, isNegative = false, icon }) => (
  <motion.div 
    className="glass-card bg-white/80 backdrop-blur-md border border-white/30 p-6 rounded-xl shadow-md hover:shadow-lg transition-all relative overflow-hidden"
    whileHover={{ 
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)"
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {/* Subtle gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white opacity-70" />
    
    {/* Animated accent line */}
    <motion.div 
      className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    />
    
    {/* Animated corner decoration */}
    <motion.div
      className="absolute bottom-0 right-0 w-16 h-16 opacity-20"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.2 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-white to-white" />
    </motion.div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm text-black font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-black">{value}</h3>
      </div>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shadow-md">
        {icon}
      </div>
    </div>
    <p className={`text-sm mt-3 font-semibold flex items-center ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
      {isNegative ? (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      )}
      <span className="drop-shadow-sm">{change} vs last week</span>
    </p>
  </motion.div>
);