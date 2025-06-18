import React from 'react';
import { StatsCard } from './StatsCard';
import { BarChart, TrendingUp } from "lucide-react";

export const StatsGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatsCard
      title="Total Clicks"
      value="24,516"
      change="+12.3%"
      icon={<BarChart className="w-5 h-5" />}
    />
    <StatsCard
      title="Unique Visitors"
      value="18,472"
      change="+8.7%"
      icon={<TrendingUp className="w-5 h-5" />}
    />
    <StatsCard
      title="Conversion Rate"
      value="3.2%"
      change="-1.4%"
      isNegative
      icon={<TrendingUp className="w-5 h-5" />}
    />
    <StatsCard
      title="Avg. Time"
      value="2m 34s"
      change="+0.8%"
      icon={<TrendingUp className="w-5 h-5" />}
    />
  </div>
);