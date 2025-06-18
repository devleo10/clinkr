import React from 'react';

interface BrowserStatRowProps {
  name: string;
  percentage: number;
  trend: 'up' | 'down';
  change: number;
}

export const BrowserStatRow: React.FC<BrowserStatRowProps> = ({ name, percentage, trend, change }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">{name}</span>
    <div className="flex items-center">
      <div className="w-32 h-2 bg-gray-100 rounded-full mr-3">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-500">{percentage}% </span>
      <span className={`text-xs ml-2 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend === 'up' ? '⬆' : '⬇'} {change}%
      </span>
    </div>
  </div>
);