import React from 'react';
import { motion } from 'framer-motion';

interface BrowserStatRowProps {
  name: string;
  percentage: number;
  trend: 'up' | 'down';
  change: number;
}

export const BrowserStatRow: React.FC<BrowserStatRowProps> = ({ name, percentage, trend, change }) => (
  <motion.div 
    className="glass-card bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-3 my-3 relative overflow-hidden"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.02, boxShadow: "0 4px 12px -2px rgba(99, 102, 241, 0.15)" }}
  >
    {/* Subtle gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
    
    <div className="flex items-center justify-between py-1 relative z-10">
      <span className="text-sm font-medium text-gray-700">{name}</span>
      <div className="flex items-center">
        <div className="w-32 h-2.5 bg-gray-100 rounded-full mr-3 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            style={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-sm font-semibold text-indigo-700 drop-shadow-sm">{percentage}%</span>
        <span className={`text-xs ml-2 font-medium flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'} drop-shadow-sm`}>
          {trend === 'up' ? (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          {change}%
        </span>
      </div>
    </div>
  </motion.div>
);