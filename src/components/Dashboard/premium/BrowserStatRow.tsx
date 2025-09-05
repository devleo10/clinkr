import React from 'react';

interface BrowserStatRowProps {
  name: string;
  percentage: number;
  trend: 'up' | 'down';
  change: number;
}

export const BrowserStatRow: React.FC<BrowserStatRowProps> = ({ name, percentage, trend, change }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
    <span className="text-sm font-medium text-gray-700">{name}</span>
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-orange-700">{percentage}%</span>
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs font-medium flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
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
);