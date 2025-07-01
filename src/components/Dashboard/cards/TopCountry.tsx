import { FaGlobeAsia } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { motion } from 'framer-motion';

const TopCountry = () => {
  const [topCountry, setTopCountry] = useState({
    name: '',
    clicks: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchTopCountry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get the user's profile and link analytics data
      const { data, error } = await supabase
        .from('link_analytics')
        .select('country_code, region')
        .eq('profile_id', user.id);

      if (error) throw error;

      // Calculate country statistics, handling null/undefined values
      const countryStats = data.reduce((acc, curr) => {
        const country = curr.country_code || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalClicks = data.length;
      
      if (totalClicks === 0) {
        setTopCountry({
          name: 'No Data',
          clicks: 0,
          percentage: 0
        });
        return;
      }

      const sortedCountries = Object.entries(countryStats)
        .sort(([, a], [, b]) => b - a)
        .filter(([country]) => country !== 'Unknown');

      if (sortedCountries.length > 0) {
        const [country, clicks] = sortedCountries[0];
        setTopCountry({
          name: getCountryName(country),
          clicks: clicks,
          percentage: totalClicks > 0 ? Math.round((clicks / totalClicks) * 1000) / 10 : 0
        });
      } else {
        setTopCountry({
          name: 'No Location Data',
          clicks: 0,
          percentage: 0
        });
      }
    } catch (error) {
      console.error('Error fetching top country:', error);
      setTopCountry({
        name: 'Error',
        clicks: 0,
        percentage: 0
      });
    } finally {
      setLoading(false);
    }
  };

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

  
  useEffect(() => {
    fetchTopCountry();
  }, []);

  return (
    <motion.div 
      className="w-full glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl hover:border-indigo-200 flex flex-col justify-between min-h-[180px] shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)"
      }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
      
      {/* Animated accent */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      
      <div className="flex justify-between items-center relative z-10">
        <h1 className="font-bold text-gray-800">Top Country</h1>
        <div className="text-indigo-500">
          <FaGlobeAsia size={24} />
        </div>
      </div>
      <div className="mt-8 flex relative z-10">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">
          {loading ? (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          ) : (
            topCountry.name
          )}
        </h1>
      </div>
      <div className="relative z-10">
        <p className="text-sm text-gray-500 font-medium">
          {loading ? (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          ) : (
            `${topCountry.clicks.toLocaleString()} Clicks (${topCountry.percentage}%)`
          )}
        </p>
      </div>
    </motion.div>
  );
}

export default TopCountry;