import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { motion } from 'framer-motion';

const TotalClicks = () => {
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [percentageChange, setPercentageChange] = useState(0);

  useEffect(() => {
    fetchTotalClicks();
  }, []);

  const fetchTotalClicks = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current date and date 30 days ago
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      // Get clicks for current period
      const { data: currentData, error: currentError } = await supabase
        .from('link_analytics')
        .select('id')
        .eq('profile_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (currentError) throw currentError;

      // Get clicks for previous period (30-60 days ago)
      const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const { data: previousData, error: previousError } = await supabase
        .from('link_analytics')
        .select('id')
        .eq('profile_id', user.id)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (previousError) throw previousError;

      // Calculate total clicks and percentage change
      const currentClicks = currentData?.length || 0;
      const previousClicks = previousData?.length || 0;

      setTotalClicks(currentClicks);

      // Calculate percentage change
      if (previousClicks === 0) {
        setPercentageChange(currentClicks > 0 ? 100 : 0);
      } else {
        const change = ((currentClicks - previousClicks) / previousClicks) * 100;
        setPercentageChange(Number(change.toFixed(1)));
      }

    } catch (error) {
      console.error('Error fetching clicks:', error);
    } finally {
      setLoading(false);
    }
  };

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
      
      <div className="flex justify-between relative z-10">
        <h1 className="font-bold text-gray-800">Total Clicks</h1>
        <p className={`${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'} font-semibold px-2 py-1 rounded-md ${percentageChange >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          {percentageChange >= 0 ? '+' : ''}{percentageChange}%
        </p>
      </div>
      <div className="mt-8 flex relative z-10">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">
          {loading ? (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          ) : (
            totalClicks.toLocaleString()
          )}
        </h1>
      </div>
      <div className="relative z-10">
        <p className="text-sm text-gray-500 font-medium">Last 30 Days</p>
      </div>
    </motion.div>
  );
};

export default TotalClicks;