import { FaGlobeAsia } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';



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
      // Add more countries as needed
    };
    return countryNames[code] || code;
  };

  
  useEffect(() => {
    fetchTopCountry();
  }, []);

  return (
    <div className="w-full border-2 p-5 rounded-[10px] hover:border-[#4F46E5] flex flex-col justify-between min-h-[150px]">
      <div className="flex justify-between">
        <h1>Top Country</h1>
        <FaGlobeAsia size={30} />
      </div>
      <div className="mt-8 flex">
        <h1 className="text-3xl font-bold">
          {loading ? '...' : topCountry.name}
        </h1>
      </div>
      <div>
        <p className="text-sm text-gray-500">
          {loading ? '...' : `${topCountry.clicks.toLocaleString()} Clicks (${topCountry.percentage}%)`}
        </p>
      </div>
    </div>
  );
}

export default TopCountry;