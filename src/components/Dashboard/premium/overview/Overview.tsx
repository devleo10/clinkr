import { StatsGrid } from './StatsGrid'
import { TabsContent } from '@radix-ui/react-tabs'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import { motion } from 'framer-motion'

interface OverviewData {
  totalClicks: string;
  uniqueVisitors: string;
  conversionRate: string;
  avgTime: string;
  totalViews: string;
  changes: {
    clicks: string;
    visitors: string;
    conversion: string;
    time: string;
    views: string;
  };
}

const Overview = () => {
  const [overviewData, setOverviewData] = useState<OverviewData>({
    totalClicks: '0',
    uniqueVisitors: '0',
    conversionRate: '0%',
    avgTime: '0s',
    totalViews: '0',
    changes: {
      clicks: '0%',
      visitors: '0%',
      conversion: '0%',
      time: '0%',
      views: '0%'
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get current date and date 30 days ago for comparison
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(now.getDate() - 60);
      
      // Format dates for queries
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
      const sixtyDaysAgoStr = sixtyDaysAgo.toISOString();

      // Fetch current period profile views
      const { data: currentProfileViews, error: currentProfileViewsError } = await supabase
          .from('profile_views')
          .select('viewer_hash, viewed_at')
          .eq('profile_id', user.id)
          .gte('viewed_at', thirtyDaysAgoStr);

      if (currentProfileViewsError) throw currentProfileViewsError;

      // Fetch previous period profile views
      const { data: previousProfileViews, error: previousProfileViewsError } = await supabase
          .from('profile_views')
          .select('viewer_hash, viewed_at')
          .eq('profile_id', user.id)
          .gte('viewed_at', sixtyDaysAgoStr)
          .lt('viewed_at', thirtyDaysAgoStr);

      if (previousProfileViewsError) throw previousProfileViewsError;

      // Calculate unique visitors for current and previous periods
      const currentUniqueVisitors = new Set(currentProfileViews.map(item => item.viewer_hash)).size;
      const previousUniqueVisitors = new Set(previousProfileViews.map(item => item.viewer_hash)).size;
      
      // Calculate visitor change percentage
      const visitorChangePercent = previousUniqueVisitors > 0 
          ? ((currentUniqueVisitors - previousUniqueVisitors) / previousUniqueVisitors * 100).toFixed(1)
          : '100.0';

      // Fetch current period link analytics
      const { data: currentAnalytics, error: currentAnalyticsError } = await supabase
          .from('link_analytics')
          .select('*')
          .eq('profile_id', user.id)
          .gte('created_at', thirtyDaysAgoStr);

      if (currentAnalyticsError) throw currentAnalyticsError;

      // Fetch previous period link analytics
      const { data: previousAnalytics, error: previousAnalyticsError } = await supabase
          .from('link_analytics')
          .select('*')
          .eq('profile_id', user.id)
          .gte('created_at', sixtyDaysAgoStr)
          .lt('created_at', thirtyDaysAgoStr);

      if (previousAnalyticsError) throw previousAnalyticsError;

      // Calculate clicks for current and previous periods
      const currentClicks = currentAnalytics.filter(item => item.event_type === 'click').length;
      const previousClicks = previousAnalytics.filter(item => item.event_type === 'click').length;
      
      // Calculate click change percentage
      const clickChangePercent = previousClicks > 0 
          ? ((currentClicks - previousClicks) / previousClicks * 100).toFixed(1)
          : '100.0';

      // Calculate conversion rate (clicks / views)
      const currentConversionRate = currentUniqueVisitors > 0 
          ? ((currentClicks / currentUniqueVisitors) * 100).toFixed(1)
          : '0.0';
      const previousConversionRate = previousUniqueVisitors > 0 
          ? ((previousClicks / previousUniqueVisitors) * 100).toFixed(1)
          : '0.0';
      
      // Calculate conversion rate change
      const conversionChangePercent = parseFloat(previousConversionRate) > 0 
          ? ((parseFloat(currentConversionRate) - parseFloat(previousConversionRate)) / parseFloat(previousConversionRate) * 100).toFixed(1)
          : '0.0';

      // Calculate average session time (simplified - would need more data for accuracy)
      // For now using a placeholder calculation based on number of interactions per visitor
      const currentAvgInteractions = currentUniqueVisitors > 0 
          ? (currentAnalytics.length / currentUniqueVisitors).toFixed(1)
          : '0.0';
      const previousAvgInteractions = previousUniqueVisitors > 0 
          ? (previousAnalytics.length / previousUniqueVisitors).toFixed(1)
          : '0.0';
      
      // Convert to seconds (arbitrary multiplier for demonstration)
      const currentAvgTimeSeconds = Math.round(parseFloat(currentAvgInteractions) * 45);
      const previousAvgTimeSeconds = Math.round(parseFloat(previousAvgInteractions) * 45);
      
      // Format average time
      const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
      };
      
      const avgTimeChangePercent = previousAvgTimeSeconds > 0 
          ? ((currentAvgTimeSeconds - previousAvgTimeSeconds) / previousAvgTimeSeconds * 100).toFixed(1)
          : '0.0';

      // Calculate view change percentage
      const currentViews = currentProfileViews.length;
      const previousViews = previousProfileViews.length;
      const viewChangePercent = previousViews > 0 
          ? ((currentViews - previousViews) / previousViews * 100).toFixed(1)
          : '100.0';

      // Set the overview data with real calculations
      setOverviewData({
          totalClicks: currentClicks.toString(),
          uniqueVisitors: currentUniqueVisitors.toString(),
          conversionRate: `${currentConversionRate}%`,
          avgTime: formatTime(currentAvgTimeSeconds),
          totalViews: currentProfileViews.length.toString(),
          changes: {
              clicks: `${parseFloat(clickChangePercent) >= 0 ? '+' : ''}${clickChangePercent}%`,
              visitors: `${parseFloat(visitorChangePercent) >= 0 ? '+' : ''}${visitorChangePercent}%`,
              conversion: `${parseFloat(conversionChangePercent) >= 0 ? '+' : ''}${conversionChangePercent}%`,
              time: `${parseFloat(avgTimeChangePercent) >= 0 ? '+' : ''}${avgTimeChangePercent}%`,
              views: `${parseFloat(viewChangePercent) >= 0 ? '+' : ''}${viewChangePercent}%`
          }
      });
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <TabsContent value="overview" className="space-y-6">
        {isLoading ? (
          <motion.div 
            className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl flex justify-center items-center min-h-[200px] relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
            
            <motion.div 
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-indigo-600 font-medium">Loading overview data...</p>
            </div>
          </motion.div>
        ) : (
          <>
            <StatsGrid
              totalClicks={overviewData.totalClicks}
              uniqueVisitors={overviewData.uniqueVisitors}
              conversionRate={overviewData.conversionRate}
              totalViews={overviewData.totalViews}
              changes={overviewData.changes}
            />
            
            <motion.div 
              className="glass-card bg-white/80 backdrop-blur-md border border-white/30 p-6 rounded-xl shadow-md mt-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">Key Insights</h3>
                <p className="text-gray-800 font-medium">
                  {parseFloat(overviewData.changes.visitors.replace(/[+%]/g, '')) > 0 
                    ? `Your profile traffic has increased by ${overviewData.changes.visitors} compared to last week.` 
                    : `Your profile traffic has decreased by ${overviewData.changes.visitors.replace('+', '')} compared to last week.`}
                  {' '}
                  {parseInt(overviewData.conversionRate) > 0 
                    ? `Your conversion rate is ${overviewData.conversionRate}.` 
                    : 'Try to improve your conversion rate by enhancing your profile content.'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </TabsContent>
    </div>
  );
};

export default Overview;
