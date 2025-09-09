import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface DashboardData {
  totalClicks: number;
  percentageChange: number;
  topCountries: Array<{ country: string; visits: number }>;
  deviceSplit: { mobile: number; desktop: number; tablet: number };
  links: Array<{ title: string; url: string; clicks: number }>;
  lastFetch: number;
}

interface DashboardDataContextType {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
};

interface DashboardDataProviderProps {
  children: React.ReactNode;
}

export const DashboardDataProvider: React.FC<DashboardDataProviderProps> = ({ children }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Calculate date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(now.getDate() - 60);

      // Single batch query for all analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('link_analytics')
        .select('id, country_code, device_type, created_at')
        .eq('profile_id', user.id)
        .gte('created_at', sixtyDaysAgo.toISOString());

      if (analyticsError) throw analyticsError;

      // Get profile links data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('links, link_title')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get click counts for links
      const { data: clickData, error: clickError } = await supabase
        .rpc('get_link_clicks', { user_id_param: user.id });

      if (clickError) throw clickError;

      // Process analytics data
      const currentPeriodData = analyticsData?.filter(item => 
        new Date(item.created_at) >= thirtyDaysAgo
      ) || [];
      
      const previousPeriodData = analyticsData?.filter(item => {
        const date = new Date(item.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }) || [];

      // Calculate total clicks and percentage change
      const currentClicks = currentPeriodData.length;
      const previousClicks = previousPeriodData.length;
      const percentageChange = previousClicks === 0 
        ? (currentClicks > 0 ? 100 : 0)
        : ((currentClicks - previousClicks) / previousClicks) * 100;

      // Calculate top countries
      const countryVisits: Record<string, number> = {};
      currentPeriodData.forEach(item => {
        const country = item.country_code || 'Unknown';
        countryVisits[country] = (countryVisits[country] || 0) + 1;
      });
      const topCountries = Object.entries(countryVisits)
        .map(([country, visits]) => ({ country, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5);

      // Calculate device split
      const deviceCounts: Record<string, number> = {};
      currentPeriodData.forEach(item => {
        const device = item.device_type || 'Unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      const totalDeviceCount = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
      const deviceSplit = {
        mobile: Math.round(((deviceCounts.mobile || 0) / totalDeviceCount) * 100) || 0,
        desktop: Math.round(((deviceCounts.desktop || 0) / totalDeviceCount) * 100) || 0,
        tablet: Math.round(((deviceCounts.tablet || 0) / totalDeviceCount) * 100) || 0,
      };

      // Process links data
      const clickCounts = new Map();
      if (clickData) {
        clickData.forEach((item: any) => {
          clickCounts.set(item.link_url, parseInt(item.click_count));
        });
      }

      const links: Array<{ title: string; url: string; clicks: number }> = [];
      if (profileData && profileData.links && profileData.link_title) {
        const userLinks = Array.isArray(profileData.links) 
          ? profileData.links 
          : (profileData.links ? JSON.parse(profileData.links) : []);
          
        const titles = Array.isArray(profileData.link_title) 
          ? profileData.link_title 
          : (profileData.link_title ? JSON.parse(profileData.link_title) : []);
        
        for (let i = 0; i < userLinks.length; i++) {
          const url = userLinks[i];
          if (typeof url === 'string') {
            links.push({
              title: titles[i] || url,
              url: url,
              clicks: clickCounts.get(url) || 0
            });
          }
        }
      }

      const dashboardData: DashboardData = {
        totalClicks: currentClicks,
        percentageChange: Number(percentageChange.toFixed(1)),
        topCountries,
        deviceSplit,
        links,
        lastFetch: Date.now()
      };

      setData(dashboardData);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    <DashboardDataContext.Provider value={{ data, isLoading, error, refetch }}>
      {children}
    </DashboardDataContext.Provider>
  );
};
