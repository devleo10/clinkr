import React from 'react';
import { motion } from 'framer-motion';

interface DeviceStatRowProps {
  icon: React.ReactNode;
  label: string;
  percentage: number;
}

export const DeviceStatRow: React.FC<DeviceStatRowProps> = ({ icon, label, percentage }) => (
  <motion.div 
    className="glass-card bg-white/80 backdrop-blur-md border border-white/30 rounded-lg p-3 my-3 relative overflow-hidden"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.02, boxShadow: "0 4px 12px -2px rgba(99, 102, 241, 0.15)" }}
  >
    {/* Subtle gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
    
    <div className="flex items-center relative z-10">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-indigo-600 mr-3">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-indigo-700 drop-shadow-sm">{percentage}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            style={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  </motion.div>
);