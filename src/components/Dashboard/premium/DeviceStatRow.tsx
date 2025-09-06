import React from 'react';

interface DeviceStatRowProps {
  icon: React.ReactNode;
  label: string;
  percentage: number;
}

export const DeviceStatRow: React.FC<DeviceStatRowProps> = ({ icon, label, percentage }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
    <div className="flex items-center">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 mr-3">
        {icon}
      </div>
  <span className="text-sm font-medium text-black">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-700">{percentage}%</span>
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  </div>
);