import { FaLaptop, FaMobileAlt } from 'react-icons/fa';
import { useDashboardData } from '../DashboardDataContext';

const DeviceSplit = () => {
  const { data, isLoading } = useDashboardData();

  const deviceData = data?.deviceSplit || { mobile: 0, desktop: 0, tablet: 0 };

  return (
    <div 
      className="w-full glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl flex flex-col justify-between min-h-[180px] shadow-lg transition-all relative overflow-hidden"
      style={{ willChange: 'transform' }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/50 to-orange-100/50 opacity-70" />
      
      {/* Animated accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400" />
      
      <div className="flex justify-between items-center relative z-10">
        <h1 className="font-bold text-black">Device Split</h1>
        <div className="flex space-x-2 text-orange-500">
          <FaMobileAlt size={18} />
          <FaLaptop size={18} />
        </div>
      </div>
      <div className="flex gap-10 mt-4 relative z-10">
        <div className="text-center flex-1">
          <div className="flex items-center justify-center mb-2">
            <FaMobileAlt className="text-orange-500 mr-2" size={16} />
            <p className="text-black font-medium">Mobile</p>
          </div>
          <p className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              `${deviceData.mobile}%`
            )}
          </p>
        </div>
        <div className="text-center flex-1">
          <div className="flex items-center justify-center mb-2">
            <FaLaptop className="text-orange-500 mr-2" size={16} />
            <p className="text-black font-medium">Desktop</p>
          </div>
          <p className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              `${deviceData.desktop}%`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceSplit;