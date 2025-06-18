import React from 'react';

interface DeviceStatRowProps {
  icon: React.ReactNode;
  label: string;
  percentage: number;
}

export const DeviceStatRow: React.FC<DeviceStatRowProps> = ({ icon, label, percentage }) => (
  <div className="flex items-center">
    <div className="text-gray-400 mr-3">{icon}</div>
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-500">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  </div>
);