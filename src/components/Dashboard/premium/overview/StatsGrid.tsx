import React from 'react';
import { StatsCard } from './StatsCard';
import { BarChart, TrendingUp, Users, Clock } from "lucide-react";
import { motion } from 'framer-motion';

// Animation variants for staggered animation
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const StatsGrid: React.FC = () => (
  <motion.div 
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    variants={container}
    initial="hidden"
    animate="show"
  >
    <StatsCard
      title="Total Clicks"
      value="24,516"
      change="+12.3%"
      icon={<BarChart size={18} />}
    />
    <StatsCard
      title="Unique Visitors"
      value="18,472"
      change="+8.7%"
      icon={<Users size={18} />}
    />
    <StatsCard
      title="Conversion Rate"
      value="3.2%"
      change="-1.4%"
      isNegative
      icon={<TrendingUp size={18} />}
    />
    <StatsCard
      title="Avg. Time"
      value="2m 34s"
      change="+0.8%"
      icon={<Clock size={18} />}
    />
  </motion.div>
);