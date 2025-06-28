import { TabsContent } from "@radix-ui/react-tabs";
import { useState, useEffect, } from "react";
import { ArrowUpRight, ArrowDownRight, MousePointerClick, Eye, Clock, Filter } from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
// Interface for analytics data
interface AnalyticsItem {
  id: string;
  profile_id: string;
  user_id: string;
  event_type: string;
  device_type: string;
  browser: string;
  country_code: string;
  region: string;
  city: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  link_url?: string; // Added property to fix compile error
}

interface ProfileView {
  id: string;
  profile_id: string;
  viewer_hash: string;
  viewed_at: string; // Updated from created_at to viewed_at
}

interface TrendData {
  total: number;
  growth: number;
  dailyAverage: number;
  peakDay: string;
  peakTime?: string;
}

interface EngagementMetric {
  metric: string;
  value: string;
  trend: "up" | "down";
  change: number;
}

const Trends = () => {
  // State for analytics data
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<"7days" | "30days" | "90days">("30days");
  const [deviceFilter, setDeviceFilter] = useState<"all" | "mobile" | "desktop">("all");
  
  // State for trend data
  const [clickTrends, setClickTrends] = useState<TrendData>({
    total: 0,
    growth: 0,
    dailyAverage: 0,
    peakDay: ""
  });

  const [viewTrends, setViewTrends] = useState<TrendData>({
    total: 0,
    growth: 0,
    dailyAverage: 0,
    peakDay: "",
    peakTime: ""
  });

  const [engagementData, setEngagementData] = useState<EngagementMetric[]>([
    { metric: "Avg. Time on Link", value: "0s", trend: "up", change: 0 },
    { metric: "Bounce Rate", value: "0%", trend: "down", change: 0 },
    { metric: "Return Visits", value: "0%", trend: "up", change: 0 }
  ]);

  const [trendInsights, setTrendInsights] = useState<string[]>([]);
  
  // Raw data storage
  const [analyticsData, setAnalyticsData] = useState<AnalyticsItem[]>([]);
  const [profileViewsData, setProfileViewsData] = useState<ProfileView[]>([]);
  
  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        // Calculate date range based on timeFrame
        const now = new Date();
        let startDate = new Date();
        
        if (timeFrame === "7days") {
          startDate.setDate(now.getDate() - 7);
        } else if (timeFrame === "30days") {
          startDate.setDate(now.getDate() - 30);
        } else if (timeFrame === "90days") {
          startDate.setDate(now.getDate() - 90);
        }
        
        // Format dates for Supabase query
        const startDateStr = startDate.toISOString();
        
        // Fetch link analytics data
        const { data: analytics, error: analyticsError } = await supabase
          .from('link_analytics')
          .select('*')
          .eq('profile_id', user.id)
          .gte('created_at', startDateStr);
          
        if (analyticsError) throw analyticsError;
        
        // Fetch profile views data
        const { data: profileViews, error: profileViewsError } = await supabase
          .from('profile_views')
          .select('*')
          .eq('profile_id', user.id)
          .gte('viewed_at', startDateStr);
        
        if (profileViewsError) throw profileViewsError;
        
        // Store raw data
        setAnalyticsData(analytics || []);
        setProfileViewsData(profileViews || []);
        
        // Process data
        processData(analytics || [], profileViews || []);
      } catch (error) {
        console.error('Error fetching trends data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [timeFrame]);
  
  // Process data when filters change
  useEffect(() => {
    if (analyticsData.length > 0 || profileViewsData.length > 0) {
      processData(analyticsData, profileViewsData);
    }
  }, [deviceFilter, analyticsData, profileViewsData]);
  
  // Process and calculate metrics
  const processData = (analytics: AnalyticsItem[], profileViews: ProfileView[]) => {
    // Filter data based on device type if needed
    const filteredAnalytics = deviceFilter === "all" 
      ? analytics 
      : analytics.filter(item => {
          if (deviceFilter === "mobile") {
            return item.device_type.toLowerCase().includes("mobile") || 
                   item.device_type.toLowerCase().includes("tablet");
          } else {
            return item.device_type.toLowerCase().includes("desktop") || 
                   item.device_type.toLowerCase().includes("laptop");
          }
        });
    
    // Calculate click trends
    const clicks = filteredAnalytics.filter(item => item.event_type === "click");
    
    // Calculate total clicks
    const totalClicks = clicks.length;
    
    // Calculate daily average
    const clicksByDay = clicks.reduce((acc: {[key: string]: number}, item) => {
      const date = new Date(item.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const uniqueDays = Object.keys(clicksByDay).length || 1;
    const dailyAvgClicks = Math.round(totalClicks / uniqueDays);
    
    // Find peak day
    let peakDay = "";
    let maxClicks = 0;
    
    Object.entries(clicksByDay).forEach(([date, count]) => {
      if (count > maxClicks) {
        maxClicks = count;
        peakDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      }
    });
    
    // Calculate growth (comparing first half to second half of period)
    const sortedClicks = [...clicks].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const midPoint = Math.floor(sortedClicks.length / 2);
    const firstHalf = sortedClicks.slice(0, midPoint).length || 1;
    const secondHalf = sortedClicks.slice(midPoint).length || 1;
    const growthRate = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
    
    // Update click trends
    setClickTrends({
      total: totalClicks,
      growth: growthRate,
      dailyAverage: dailyAvgClicks,
      peakDay: peakDay || "N/A"
    });
    
    // Calculate view trends
    const totalViews = profileViews.length;
    
    // Calculate views by day
    const viewsByDay = profileViews.reduce((acc: {[key: string]: number}, item) => {
      const date = new Date(item.viewed_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const uniqueViewDays = Object.keys(viewsByDay).length || 1;
    const dailyAvgViews = Math.round(totalViews / uniqueViewDays);
    
    // Find peak day for views
    let peakViewDay = "";
    let maxViews = 0;
    
    Object.entries(viewsByDay).forEach(([date, count]) => {
      if (count > maxViews) {
        maxViews = count;
        peakViewDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      }
    });
    
    // Calculate peak time (12-hour format)
    const viewsByHour = profileViews.reduce((acc: {[key: string]: number}, item) => {
      const hour = new Date(item.viewed_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    let peakHour = 0;
    let maxViewsPerHour = 0;

    Object.entries(viewsByHour).forEach(([hour, count]) => {
      if (count > maxViewsPerHour) {
        maxViewsPerHour = count;
        peakHour = parseInt(hour);
      }
    });

    // Format peak time in 12-hour format
    function formatHour12(hour: number) {
      const period = hour >= 12 ? 'PM' : 'AM';
      let h = hour % 12;
      if (h === 0) h = 12;
      return `${h} ${period}`;
    }
    // Only set peak time if there is data
    let peakTimeRange = "N/A";
    if (profileViews.length > 0) {
      peakTimeRange = peakHour !== undefined
        ? `${formatHour12(peakHour)} - ${formatHour12((peakHour + 2) % 24)}`
        : "N/A";
    }
    
    // Update view trends
    setViewTrends({
      total: totalViews,
      growth: growthRate, // Corrected from viewGrowthRate to growthRate
      dailyAverage: dailyAvgViews,
      peakDay: peakViewDay || "N/A",
      peakTime: peakTimeRange
    });
    
    // Calculate engagement metrics
    
    // 1. Average time on link (using created_at timestamps)
    let avgTimeValue = "0s";
    let timeChangePercent = 0;
    if (clicks.length > 1) {
      // Group clicks by user_id and link_url
      const grouped: { [key: string]: AnalyticsItem[] } = {};
      clicks.forEach(item => {
        const key = `${item.user_id || ''}|${item.link_url || ''}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });
      // Collect all time differences
      let totalDuration = 0;
      let count = 0;
      Object.values(grouped).forEach(events => {
        // Sort by created_at
        const sorted = events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        for (let i = 1; i < sorted.length; i++) {
          const diff = (new Date(sorted[i].created_at).getTime() - new Date(sorted[i - 1].created_at).getTime()) / 1000;
          // Only count reasonable durations (e.g., less than 1 hour)
          if (diff > 0 && diff < 3600) {
            totalDuration += diff;
            count++;
          }
        }
      });
      const avgSeconds = count > 0 ? Math.round(totalDuration / count) : 0;
      avgTimeValue = avgSeconds > 60 ? `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s` : `${avgSeconds}s`;
      // timeChangePercent: not enough data for previous period, so keep as 0
    }
    
    // 2. Bounce rate (single page visits, dynamic)
    // We'll define bounce as users who only clicked once in the period
    const clickViewerCounts = clicks.reduce((acc: {[key: string]: number}, item) => {
      acc[item.user_id] = (acc[item.user_id] || 0) + 1;
      return acc;
    }, {});
    const singleClickers = Object.values(clickViewerCounts).filter(count => count === 1).length;
    const totalClickViewers = Object.keys(clickViewerCounts).length || 1;
    const bounceRate = Math.round((singleClickers / totalClickViewers) * 100);
    
    // 3. Return visits (dynamic)
    const returningClickers = Object.values(clickViewerCounts).filter(count => count > 1).length;
    const returnRate = Math.round((returningClickers / totalClickViewers) * 100);
    
    // Set change as 0 for now (needs previous period for real change)
    const bounceChangePercent = 0;
    const returnChangePercent = 0;

    setEngagementData([
      { metric: "Avg. Time on Link", value: avgTimeValue, trend: "up", change: timeChangePercent },
      { metric: "Bounce Rate", value: `${bounceRate}%`, trend: "down", change: Math.abs(bounceChangePercent) },
      { metric: "Return Visits", value: `${returnRate}%`, trend: "up", change: returnChangePercent }
    ]);
    
    // Generate insights
    const insights = [];
    
    // Only push insights if there is enough data
    if (totalClicks > 0 && totalViews > 0) {
      // Click-through rate insight
      const ctr = Math.round((totalClicks / totalViews) * 100);
      insights.push(`Click-through rate is ${ctr}% ${growthRate > 0 ? 'and growing' : 'but declining'}`); 

      // Peak engagement insight
      insights.push(`Peak engagement occurs on ${peakDay || peakViewDay} during ${peakTimeRange}`);

      // Device-specific insight
      const mobileClicks = analytics.filter(item => 
        item.event_type === "click" && 
        (item.device_type?.toLowerCase().includes("mobile") || item.device_type?.toLowerCase().includes("tablet"))
      ).length;
      const desktopClicks = analytics.filter(item => 
        item.event_type === "click" && 
        (item.device_type?.toLowerCase().includes("desktop") || item.device_type?.toLowerCase().includes("laptop"))
      ).length;
      if (mobileClicks > desktopClicks) {
        insights.push(`Mobile engagement dominates with ${Math.round((mobileClicks / totalClicks) * 100)}% of clicks`);
      } else if (desktopClicks > 0) {
        insights.push(`Desktop users are more engaged with ${Math.round((desktopClicks / totalClicks) * 100)}% of clicks`);
      }

      // Browser insight if we have enough data
      const browserCounts = analytics.reduce((acc: {[key: string]: number}, item) => {
        if (item.browser) {
          acc[item.browser] = (acc[item.browser] || 0) + 1;
        }
        return acc;
      }, {});
      if (Object.keys(browserCounts).length > 0) {
        const topBrowser = Object.entries(browserCounts).sort((a, b) => b[1] - a[1])[0];
        insights.push(`${topBrowser[0]} users show highest engagement at ${Math.round((topBrowser[1] / totalClicks) * 100)}%`);
      }
    }
    setTrendInsights(insights);
  };

  return (
    <div>
      <TabsContent value="trends" className="pt-4">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <Tabs defaultValue={timeFrame} onValueChange={(value) => setTimeFrame(value as "7days" | "30days" | "90days")}>
              <TabsList className="remove-outline">
                <TabsTrigger value="7days">7 Days</TabsTrigger>
                <TabsTrigger value="30days">30 Days</TabsTrigger>
                <TabsTrigger value="90days">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <Select value={deviceFilter} onValueChange={(value) => setDeviceFilter(value as "all" | "mobile" | "desktop")}>
              <SelectTrigger className="w-[180px] remove-outline">
                <SelectValue placeholder="Device Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="mobile">Mobile Only</SelectItem>
                <SelectItem value="desktop">Desktop Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Click Trends Card */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <MousePointerClick size={20} className="text-blue-600" />
              <h2 className="text-md font-semibold text-gray-800">Click Trends</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{clickTrends.total.toLocaleString()}</h3>
                  <span className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight size={14} />
                    {clickTrends.growth}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-md font-medium">{clickTrends.dailyAverage.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peak Day</p>
                  <p className="text-md font-medium">{clickTrends.peakDay}</p>
                </div>
              </div>
            </div>
          </div>

          {/* View Trends Card */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={20} className="text-blue-600" />
              <h2 className="text-md font-semibold text-gray-800">View Trends</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{viewTrends.total.toLocaleString()}</h3>
                  <span className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight size={14} />
                    {viewTrends.growth}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-md font-medium">{viewTrends.dailyAverage.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peak Time</p>
                  <p className="text-md font-medium">{viewTrends.peakTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Metrics Card */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-blue-600" />
              <h2 className="text-md font-semibold text-gray-800">Engagement Metrics</h2>
            </div>
            <div className="space-y-3">
              {engagementData.map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{metric.value}</span>
                    <span className={`text-xs ${metric.trend === "up" ? "text-green-500" : "text-red-500"} flex items-center`}>
                      {metric.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {metric.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
        {/* Trend Insights */}
        <div className="mt-6 bg-white rounded-2xl shadow p-4">
          <h2 className="text-md font-semibold text-gray-800 mb-4">Trend Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendInsights.length > 0 ? (
              trendInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{insight}</p>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg col-span-3">
                <p className="text-sm text-gray-600">Not enough data to generate insights. Try changing the time period or adding more links.</p>
              </div>
            )}
          </div>
        </div>
        
      </TabsContent>
      <style>{`
        .remove-outline:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default Trends;