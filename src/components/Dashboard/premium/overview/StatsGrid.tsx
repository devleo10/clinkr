import React from 'react';
import { StatsCard } from './StatsCard';
import { BarChart, TrendingUp, Users, Clock, Activity } from "lucide-react";
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

interface StatsGridProps {
  totalClicks: string;
  uniqueVisitors: string;
  conversionRate: string;
  avgTime: string;
  totalViews: string;
  changes: {
    clicks: string;
    visitors: string;
    conversion: string;
    time: string;
    views: string;
  };
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalClicks,
  uniqueVisitors,
  conversionRate,
  avgTime,
  totalViews,
  changes
}) => {
  // Determine if changes are negative for UI coloring
  const isClicksNegative = changes.clicks.startsWith('-');
  const isVisitorsNegative = changes.visitors.startsWith('-');
  const isConversionNegative = changes.conversion.startsWith('-');
  const isTimeNegative = changes.time.startsWith('-');
  const isViewsNegative = changes.views.startsWith('-');

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <StatsCard
        title="Total Clicks"
        value={totalClicks}
        change={changes.clicks}
        isNegative={isClicksNegative}
        icon={<BarChart size={18} />}
      />
      <StatsCard
        title="Unique Visitors"
        value={uniqueVisitors}
        change={changes.visitors}
        isNegative={isVisitorsNegative}
        icon={<Users size={18} />}
      />
      <StatsCard
        title="Conversion Rate"
        value={conversionRate}
        change={changes.conversion}
        isNegative={isConversionNegative}
        icon={<TrendingUp size={18} />}
      />
      <StatsCard
        title="Avg. Time"
        value={avgTime}
        change={changes.time}
        isNegative={isTimeNegative}
        icon={<Clock size={18} />}
      />
      <StatsCard
        title="Total Views"
        value={totalViews}
        change={changes.views}
        isNegative={isViewsNegative}
        icon={<Activity size={18} />}
      />
    </motion.div>
  );
};