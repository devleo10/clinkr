import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface PremiumDashboardData {
  // Overview data
  overview: {
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
  };
  
  // Geography data
  geography: {
    heatmapData: Array<[number, number, number]>;
    countryStats: Array<{ country: string; visits: number; percentage: number }>;
    analyticsData: Array<any>;
  };
  
  // Devices data
  devices: {
    deviceStats: Array<{ type: string; count: number; percentage: number }>;
    browserStats: Array<{ browser: string; count: number; percentage: number }>;
  };
  
  // Trends data
  trends: {
    dailyData: Array<{ date: string; clicks: number; views: number }>;
    weeklyData: Array<{ week: string; clicks: number; views: number }>;
    monthlyData: Array<{ month: string; clicks: number; views: number }>;
  };
  
  lastFetch: number;
}

interface PremiumDashboardContextType {
  data: PremiumDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  timeFrame: string;
  setTimeFrame: (frame: string) => void;
}

const PremiumDashboardContext = createContext<PremiumDashboardContextType | undefined>(undefined);

export const usePremiumDashboardData = () => {
  const context = useContext(PremiumDashboardContext);
  if (!context) {
    throw new Error('usePremiumDashboardData must be used within a PremiumDashboardProvider');
  }
  return context;
};

interface PremiumDashboardProviderProps {
  children: React.ReactNode;
}

export const PremiumDashboardProvider: React.FC<PremiumDashboardProviderProps> = ({ children }) => {
  const [data, setData] = useState<PremiumDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState('30days');

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

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
      
      const startDateStr = startDate.toISOString();

      // Batch fetch all analytics data
      const [analyticsResult, profileViewsResult] = await Promise.all([
        supabase
          .from('link_analytics')
          .select('*')
          .eq('profile_id', user.id)
          .gte('created_at', startDateStr)
          .order('created_at', { ascending: false }),
        supabase
          .from('profile_views')
          .select('*')
          .eq('profile_id', user.id)
          .gte('viewed_at', startDateStr)
          .order('viewed_at', { ascending: false })
      ]);

      if (analyticsResult.error) throw analyticsResult.error;
      if (profileViewsResult.error) throw profileViewsResult.error;

      const analyticsData = analyticsResult.data || [];
      const profileViewsData = profileViewsResult.data || [];

      // Process Overview Data
      const currentPeriodViews = profileViewsData.length;
      const currentPeriodClicks = analyticsData.length;
      
      // Calculate previous period for comparison
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - (timeFrame === "7days" ? 7 : timeFrame === "30days" ? 30 : 90));
      
      const previousAnalyticsResult = await supabase
        .from('link_analytics')
        .select('id')
        .eq('profile_id', user.id)
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDateStr);
        
      const previousProfileViewsResult = await supabase
        .from('profile_views')
        .select('viewer_hash')
        .eq('profile_id', user.id)
        .gte('viewed_at', previousStartDate.toISOString())
        .lt('viewed_at', startDateStr);

      const previousClicks = previousAnalyticsResult.data?.length || 0;
      const previousViews = previousProfileViewsResult.data?.length || 0;

      // Calculate unique visitors
      const uniqueVisitors = new Set(profileViewsData.map(item => item.viewer_hash)).size;
      const previousUniqueVisitors = new Set(
        (previousProfileViewsResult.data || []).map(item => item.viewer_hash)
      ).size;

      // Calculate changes
      const clicksChange = previousClicks === 0 
        ? (currentPeriodClicks > 0 ? 100 : 0)
        : ((currentPeriodClicks - previousClicks) / previousClicks) * 100;
        
      const viewsChange = previousViews === 0 
        ? (currentPeriodViews > 0 ? 100 : 0)
        : ((currentPeriodViews - previousViews) / previousViews) * 100;
        
      const visitorsChange = previousUniqueVisitors === 0 
        ? (uniqueVisitors > 0 ? 100 : 0)
        : ((uniqueVisitors - previousUniqueVisitors) / previousUniqueVisitors) * 100;

      const overview = {
        totalClicks: currentPeriodClicks.toLocaleString(),
        uniqueVisitors: uniqueVisitors.toLocaleString(),
        conversionRate: currentPeriodViews > 0 ? `${Math.round((currentPeriodClicks / currentPeriodViews) * 100)}%` : '0%',
        avgTime: '0s', // This would need session data to calculate properly
        totalViews: currentPeriodViews.toLocaleString(),
        changes: {
          clicks: `${clicksChange >= 0 ? '+' : ''}${clicksChange.toFixed(1)}%`,
          visitors: `${visitorsChange >= 0 ? '+' : ''}${visitorsChange.toFixed(1)}%`,
          conversion: '+0%', // Would need more complex calculation
          time: '+0%', // Would need session data
          views: `${viewsChange >= 0 ? '+' : ''}${viewsChange.toFixed(1)}%`
        }
      };

      // Process Geography Data
      const countryVisits: Record<string, number> = {};
      const heatmapPoints: Array<[number, number, number]> = [];
      
      analyticsData.forEach(item => {
        const country = item.country_code || 'Unknown';
        countryVisits[country] = (countryVisits[country] || 0) + 1;
        
        if (item.lat && item.lng) {
          heatmapPoints.push([item.lat, item.lng, 1]);
        }
      });

      const totalVisits = Object.values(countryVisits).reduce((a, b) => a + b, 0);
      const countryStats = Object.entries(countryVisits)
        .map(([country, visits]) => ({
          country,
          visits,
          percentage: totalVisits > 0 ? Math.round((visits / totalVisits) * 100) : 0
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      const geography = {
        heatmapData: heatmapPoints,
        countryStats,
        analyticsData
      };

      // Process Devices Data
      const deviceCounts: Record<string, number> = {};
      const browserCounts: Record<string, number> = {};
      
      analyticsData.forEach(item => {
        const device = item.device_type || 'Unknown';
        const browser = item.browser || 'Unknown';
        
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });

      const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
      const totalBrowsers = Object.values(browserCounts).reduce((a, b) => a + b, 0);

      const deviceStats = Object.entries(deviceCounts)
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      const browserStats = Object.entries(browserCounts)
        .map(([browser, count]) => ({
          browser,
          count,
          percentage: totalBrowsers > 0 ? Math.round((count / totalBrowsers) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const devices = {
        deviceStats,
        browserStats
      };

      // Process Trends Data
      const dailyData: Array<{ date: string; clicks: number; views: number }> = [];
      const weeklyData: Array<{ week: string; clicks: number; views: number }> = [];
      const monthlyData: Array<{ month: string; clicks: number; views: number }> = [];

      // Group by day
      const dailyGroups: Record<string, { clicks: number; views: number }> = {};
      analyticsData.forEach(item => {
        const date = item.created_at.split('T')[0];
        dailyGroups[date] = (dailyGroups[date] || { clicks: 0, views: 0 });
        dailyGroups[date].clicks++;
      });
      
      profileViewsData.forEach(item => {
        const date = item.viewed_at.split('T')[0];
        dailyGroups[date] = (dailyGroups[date] || { clicks: 0, views: 0 });
        dailyGroups[date].views++;
      });

      Object.entries(dailyGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, data]) => {
          dailyData.push({ date, ...data });
        });

      // Group by week (simplified)
      const weeklyGroups: Record<string, { clicks: number; views: number }> = {};
      dailyData.forEach(item => {
        const week = new Date(item.date).toISOString().slice(0, 4) + '-W' + 
          Math.ceil(new Date(item.date).getDate() / 7);
        weeklyGroups[week] = (weeklyGroups[week] || { clicks: 0, views: 0 });
        weeklyGroups[week].clicks += item.clicks;
        weeklyGroups[week].views += item.views;
      });

      Object.entries(weeklyGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([week, data]) => {
          weeklyData.push({ week, ...data });
        });

      // Group by month
      const monthlyGroups: Record<string, { clicks: number; views: number }> = {};
      dailyData.forEach(item => {
        const month = item.date.slice(0, 7); // YYYY-MM
        monthlyGroups[month] = (monthlyGroups[month] || { clicks: 0, views: 0 });
        monthlyGroups[month].clicks += item.clicks;
        monthlyGroups[month].views += item.views;
      });

      Object.entries(monthlyGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, data]) => {
          monthlyData.push({ month, ...data });
        });

      const trends = {
        dailyData,
        weeklyData,
        monthlyData
      };

      const premiumData: PremiumDashboardData = {
        overview,
        geography,
        devices,
        trends,
        lastFetch: Date.now()
      };

      setData(premiumData);
    } catch (err: any) {
      console.error('Error fetching premium dashboard data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame]);

  const refetch = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Check if data is stale (older than 5 minutes)
  const isDataStale = !data || (Date.now() - data.lastFetch) > 300000; // 5 minutes

  useEffect(() => {
    if (isDataStale) {
      fetchAllData();
    }
  }, [isDataStale, fetchAllData]);

  return (
    <PremiumDashboardContext.Provider value={{ 
      data, 
      isLoading, 
      error, 
      refetch, 
      timeFrame, 
      setTimeFrame 
    }}>
      {children}
    </PremiumDashboardContext.Provider>
  );
};
