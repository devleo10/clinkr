import { useDashboardData } from '../DashboardDataContext';

const TotalClicks = () => {
  const { data, isLoading } = useDashboardData();

  return (
    <div 
      className="w-full glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl flex flex-col justify-between min-h-[180px] shadow-lg transition-all relative overflow-hidden"
      style={{ willChange: 'transform' }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/50 to-white/50 opacity-70" />
      
      {/* Animated accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400" />
      
      <div className="flex justify-between relative z-10">
        <h1 className="font-bold text-black">Total Clicks</h1>
        <p className={`${(data?.percentageChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'} font-semibold px-2 py-1 rounded-md ${(data?.percentageChange || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          {(data?.percentageChange || 0) >= 0 ? '+' : ''}{data?.percentageChange || 0}%
        </p>
      </div>
      <div className="mt-8 flex relative z-10">
        <h1 className="text-4xl font-extrabold text-black">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            (data?.totalClicks || 0).toLocaleString()
          )}
        </h1>
      </div>
      <div className="relative z-10">
        <p className="text-sm text-black font-medium">Last 30 Days</p>
      </div>
    </div>
  );
};

export default TotalClicks;