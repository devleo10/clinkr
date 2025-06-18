import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isNegative?: boolean;
  icon: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, isNegative = false, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
    <p className={`text-sm mt-2 ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
      {change} vs last week
    </p>
  </div>
);