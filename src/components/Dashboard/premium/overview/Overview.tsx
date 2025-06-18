import { StatsCard } from './StatsCard'
import { FaGlobeAmericas } from 'react-icons/fa'
import { TabsContent } from '@radix-ui/react-tabs'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabaseClient'

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

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      // Fetch unique views from profile_views table
      const { data: profileViewsData, error: profileViewsError } = await supabase
          .from('profile_views')
          .select('viewer_hash'); // Updated column name

      if (profileViewsError) throw profileViewsError;

      // Calculate unique visitors
      const uniqueVisitors = new Set(profileViewsData.map(item => item.viewer_hash)).size.toString(); // Updated column name

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
    }
  };

  return (
    <div>
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Clicks"
            value={overviewData.totalClicks}
            change={overviewData.changes.clicks}
            icon={<FaGlobeAmericas size={16} />}
          />
          <StatsCard
            title="Unique Visitors"
            value={overviewData.uniqueVisitors}
            change={overviewData.changes.visitors}
            icon={<FaGlobeAmericas size={16} />}
          />
          <StatsCard
            title="Conversion Rate"
            value={overviewData.conversionRate}
            change={overviewData.changes.conversion}
            isNegative={true}
            icon={<FaGlobeAmericas size={16} />}
          />
          <StatsCard
            title="Avg. Time"
            value={overviewData.avgTime}
            change={overviewData.changes.time}
            icon={<FaGlobeAmericas size={16} />}
          />
        </div>
        <StatsCard 
          title="Total Views"
          value={overviewData.totalViews}
          change={overviewData.changes.views}
          icon={<FaGlobeAmericas size={16} />}
        />
      </TabsContent>
    </div>
  )
}

export default Overview