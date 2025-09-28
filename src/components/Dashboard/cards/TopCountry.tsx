import { FaGlobeAsia } from "react-icons/fa";
import { useDashboardData } from '../DashboardDataContext';
import { filterAndSortCountries } from '../../../lib/countryUtils';

const TopCountry = () => {
  const { data, isLoading, error } = useDashboardData();

  // Process and validate country data
  const processedCountries = data?.topCountries ? filterAndSortCountries(data.topCountries) : [];
  
  // Get the best country to display (first valid country or fallback)
  const displayCountry = processedCountries.length > 0 
    ? processedCountries[0] 
    : { country: 'Unknown', countryName: 'No Data', visits: 0, isValid: false, flag: '' };
  
  const totalClicks = data?.totalClicks || 0;
  const percentage = totalClicks > 0 ? Math.round((displayCountry.visits / totalClicks) * 100 * 10) / 10 : 0;

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
        <h1 className="font-bold text-black">Top Country</h1>
        <div className="text-black">
          <FaGlobeAsia size={24} />
        </div>
      </div>
      <div className="mt-8 flex relative z-10">
        <div className="flex items-center gap-3">
          {displayCountry.flag && (
            <span className="text-2xl">{displayCountry.flag}</span>
          )}
          <h1 className="text-3xl font-extrabold text-black">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              displayCountry.countryName
            )}
          </h1>
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-sm text-black font-medium">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            `${displayCountry.visits.toLocaleString()} Clicks (${percentage}%)`
          )}
        </p>
        {!displayCountry.isValid && displayCountry.country !== 'Unknown' && (
          <p className="text-xs text-orange-600 mt-1">
            Country code: {displayCountry.country}
          </p>
        )}
      </div>
    </div>
  );
};

export default TopCountry;