import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface DashboardData {
  totalClicks: number;
  shortenedLinkClicks: number;
  profileViews: number;
  percentageChange: number;
  topCountries: Array<{ country: string; visits: number }>;
  deviceSplit: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
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
  if (context === undefined) {
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

  // Data validation helper functions
  const validateNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? fallback : Math.max(0, num);
  };

  // 🚀 OPTIMIZED: Single consolidated fetch using new RPC function
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication failed. Please log in again.');
      }

      // Calculate date range
      const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));

      // 🚀 USE CONSOLIDATED RPC FUNCTION (1 query instead of 5+)
      const { data: consolidatedData, error: rpcError } = await supabase.rpc(
        'get_dashboard_data_consolidated',
        { 
          p_user_id: user.id, 
          p_start_date: thirtyDaysAgo.toISOString() 
        }
      );

      if (rpcError) {
        console.warn('Consolidated RPC not available:', rpcError.message);
        throw new Error('Failed to fetch dashboard data. Please try again.');
      }

      // Parse the consolidated response
      const overview = consolidatedData?.overview || {};
      const devices = consolidatedData?.devices || {};
      const countries = consolidatedData?.countries || [];
      const links = consolidatedData?.links || [];

      // Process device split (convert counts to percentages)
      const mobileCount = validateNumber(devices.mobile);
      const desktopCount = validateNumber(devices.desktop);
      const tabletCount = validateNumber(devices.tablet);
      const totalDevices = mobileCount + desktopCount + tabletCount;

      const deviceSplit = totalDevices > 0 ? {
        mobile: Math.round((mobileCount / totalDevices) * 100),
        desktop: Math.round((desktopCount / totalDevices) * 100),
        tablet: Math.round((tabletCount / totalDevices) * 100)
      } : { mobile: 0, desktop: 0, tablet: 0 };

      // Ensure percentages add up to 100 (handle rounding)
      const totalPercentage = deviceSplit.mobile + deviceSplit.desktop + deviceSplit.tablet;
      if (totalPercentage !== 100 && totalPercentage > 0) {
        const largestCategory = Object.entries(deviceSplit)
          .reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof typeof deviceSplit;
        deviceSplit[largestCategory] += (100 - totalPercentage);
      }

      // Process top countries
      const topCountries = (countries || [])
        .map((c: any) => ({
          country: c.country || 'Unknown',
          visits: validateNumber(c.visits)
        }))
        .filter((c: any) => c.country !== 'Unknown')
        .slice(0, 5);

      // Process links
      const linksData = (links || [])
        .map((l: any) => ({
          title: l.title || 'Untitled',
          url: l.url || '',
          clicks: validateNumber(l.clicks)
        }))
        .slice(0, 50);

      // Compute totals with fallback to per-link clicks if analytics are missing
      const totalClicksFromAnalytics = validateNumber(overview.total_clicks);
      const shortenedClicksFromAnalytics = validateNumber(overview.shortened_link_clicks);
      const totalClicksFallback = linksData.reduce((sum: number, l: any) => sum + validateNumber(l.clicks), 0);

      // Create final data object
      const dashboardData: DashboardData = {
        totalClicks: totalClicksFromAnalytics > 0 ? totalClicksFromAnalytics : totalClicksFallback,
        shortenedLinkClicks: shortenedClicksFromAnalytics > 0 ? shortenedClicksFromAnalytics : totalClicksFallback,
        profileViews: validateNumber(overview.profile_views),
        percentageChange: 0, // TODO: Add historical comparison
        topCountries,
        deviceSplit,
        links: linksData,
        lastFetch: Date.now()
      };

      setData(dashboardData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
 
  const refetch = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // 🚀 OPTIMIZED: Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    data,
    isLoading,
    error,
    refetch
  }), [data, isLoading, error, refetch]);

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
};
