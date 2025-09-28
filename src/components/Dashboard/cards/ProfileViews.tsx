import { useDashboardData } from '../DashboardDataContext';

const ProfileViews = () => {
  const { data, isLoading, error } = useDashboardData();

  return (
    <div 
      className="w-full glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl flex flex-col justify-between min-h-[180px] shadow-lg transition-all relative overflow-hidden"
      style={{ willChange: 'transform' }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white/50 to-white/50 opacity-70" />
      
      {/* Animated accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400" />
      
      <div className="flex justify-between relative z-10">
        <h1 className="font-bold text-black">Profile Views</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-xs text-gray-600 font-medium">Page Views</span>
        </div>
      </div>
      <div className="mt-8 flex relative z-10">
        <h1 className="text-4xl font-extrabold text-black">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            (data?.profileViews || 0).toLocaleString()
          )}
        </h1>
      </div>
      <div className="relative z-10">
        <p className="text-sm text-black font-medium">Profile Page Visits</p>
      </div>
    </div>
  );
};

export default ProfileViews;
