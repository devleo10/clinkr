import { StatsCard } from './StatsCard'
import { 
  Users, 
  TrendingUp, 
  Clock, 
  BarChart, 
  Activity 
} from 'lucide-react'
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
      // Fetch unique views from profile_views table
      const { data: profileViewsData, error: profileViewsError } = await supabase
          .from('profile_views')
          .select('viewer_hash');

      if (profileViewsError) throw profileViewsError;

      // Calculate unique visitors
      const uniqueVisitors = new Set(profileViewsData.map(item => item.viewer_hash)).size.toString();

      // Fetch other data from link_analytics table
      const { data: analyticsData, error: analyticsError } = await supabase
          .from('link_analytics')
          .select('*');

      if (analyticsError) throw analyticsError;

      // Calculate total clicks, etc.
      const totalClicks = analyticsData.filter(item => item.event_type === 'click').length.toString();

      setOverviewData({
          totalClicks,
          uniqueVisitors,
          conversionRate: 'N/A', // Placeholder for conversion rate calculation
          avgTime: 'N/A', // Placeholder for avg time calculation
          totalViews: uniqueVisitors, // Assuming total views are the same as unique visitors
          changes: {
              clicks: '+12.3%', // Example change data
              visitors: '+8.7%',
              conversion: '-1.4%',
              time: '+0.8%',
              views: '+12.3%'
          }
      });
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants for staggered animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <StatsCard
                title="Total Clicks"
                value={overviewData.totalClicks}
                change={overviewData.changes.clicks}
                icon={<BarChart size={18} />}
              />
              <StatsCard
                title="Unique Visitors"
                value={overviewData.uniqueVisitors}
                change={overviewData.changes.visitors}
                icon={<Users size={18} />}
              />
              <StatsCard
                title="Conversion Rate"
                value={overviewData.conversionRate}
                change={overviewData.changes.conversion}
                isNegative={true}
                icon={<TrendingUp size={18} />}
              />
              <StatsCard
                title="Avg. Time"
                value={overviewData.avgTime}
                change={overviewData.changes.time}
                icon={<Clock size={18} />}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <StatsCard 
                title="Total Views"
                value={overviewData.totalViews}
                change={overviewData.changes.views}
                icon={<Activity size={18} />}
              />
            </motion.div>

            {/* Optional data summary section */}
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
                <p className="text-gray-800 font-medium">Your profile traffic has increased by <span className="text-green-800 font-semibold">12.3%</span> compared to last week. Mobile visitors account for the majority of your traffic.</p>
              </div>
            </motion.div>
          </>
        )}
      </TabsContent>
    </div>
  )
}

export default Overview