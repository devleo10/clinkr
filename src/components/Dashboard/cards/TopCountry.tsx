import { FaGlobeAsia } from "react-icons/fa";
import { useDashboardData } from '../DashboardDataContext';

const TopCountry = () => {
  const { data, isLoading } = useDashboardData();

  // Helper function to get country name from code
  const getCountryName = (code: string) => {
    const countryNames: { [key: string]: string } = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'IN': 'India',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan',
      'CN': 'China',
      'BR': 'Brazil',
      'RU': 'Russia',
      'IT': 'Italy',
      'ES': 'Spain',
      'MX': 'Mexico',
      'KR': 'South Korea',
      'NL': 'Netherlands',
      'CH': 'Switzerland',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'SG': 'Singapore',
      'NZ': 'New Zealand',
      'ZA': 'South Africa',
      'IE': 'Ireland',
      'AE': 'United Arab Emirates',
      'AR': 'Argentina',
      'PL': 'Poland',
      'TR': 'Turkey',
      'ID': 'Indonesia',
      'TH': 'Thailand',
      'VN': 'Vietnam',
      'MY': 'Malaysia',
      'PH': 'Philippines',
      'BE': 'Belgium',
      'PT': 'Portugal',
      'GR': 'Greece',
      'AT': 'Austria',
      'IL': 'Israel',
      'UA': 'Ukraine',
      'Unknown': 'Unknown'
    };
    return countryNames[code] || code;
  };

  const topCountry = data?.topCountries?.[0] || { country: 'No Data', visits: 0 };
  const totalClicks = data?.totalClicks || 0;
  const percentage = totalClicks > 0 ? Math.round((topCountry.visits / totalClicks) * 100 * 10) / 10 : 0;

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
        <h1 className="text-3xl font-extrabold text-black">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            getCountryName(topCountry.country)
          )}
        </h1>
      </div>
      <div className="relative z-10">
        <p className="text-sm text-black font-medium">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            `${topCountry.visits.toLocaleString()} Clicks (${percentage}%)`
          )}
        </p>
      </div>
    </div>
  );
};

export default TopCountry;