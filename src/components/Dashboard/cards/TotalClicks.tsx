

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

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
    <div className="w-full border-2 p-5 rounded-[10px] hover:border-[#4F46E5] flex flex-col justify-between min-h-[150px]">
      <div className="flex justify-between">
        <h1>Total Clicks</h1>
        <p className={`${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {percentageChange >= 0 ? '+' : ''}{percentageChange}%
        </p>
      </div>
      <div className="mt-8 flex">
        <h1 className="text-3xl font-bold">
          {loading ? '...' : totalClicks.toLocaleString()}
        </h1>
      </div>
      <div>
        <p className="text-sm text-gray-500">Last 30 Days</p>
      </div>
    </div>
  );
};

export default TotalClicks;