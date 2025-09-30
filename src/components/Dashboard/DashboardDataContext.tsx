import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

  const validateDate = (dateString: string): Date | null => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 100) / 100; // Round to 2 decimal places
  };

  const normalizeDeviceType = (deviceType: string | null | undefined): string => {
    if (!deviceType) return 'Unknown';
    
    const normalized = deviceType.toLowerCase().trim();
    
    // Map common variations to standard types
    if (normalized.includes('mobile') || normalized.includes('phone') || normalized.includes('android') || normalized.includes('iphone')) {
      return 'mobile';
    }
    if (normalized.includes('desktop') || normalized.includes('pc') || normalized.includes('mac') || normalized.includes('windows')) {
      return 'desktop';
    }
    if (normalized.includes('tablet') || normalized.includes('ipad')) {
      return 'tablet';
    }
    
    return normalized; // Return as-is if it doesn't match common patterns
  };

  const normalizeCountryCode = (countryCode: string | null | undefined): string => {
    if (!countryCode) return 'Unknown';
    
    // Convert to uppercase and validate length
    const normalized = countryCode.toUpperCase().trim();
    if (normalized.length === 2) {
      return normalized;
    }
    
    return 'Unknown';
  };

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user with proper error handling
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User authentication error:', userError);
        throw new Error('Authentication failed. Please log in again.');
      }
      if (!user) {
        throw new Error('No user found. Please log in.');
      }

      // Calculate date ranges with proper timezone handling
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

      console.log('Fetching data for user:', user.id);
      console.log('Date range:', {
        now: now.toISOString(),
        thirtyDaysAgo: thirtyDaysAgo.toISOString(),
        sixtyDaysAgo: sixtyDaysAgo.toISOString()
      });

      // Parallel data fetching + RPC aggregation
      const [analyticsResult, shortenedLinksResult, rpcOverview, rpcDevices, rpcCountry] = await Promise.all([
        supabase
          .from('link_analytics')
          .select('id, country_code, device_type, created_at, event_type, hashed_ip, link_type')
          .eq('user_id', user.id)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('shortened_links')
          .select('id, short_code, original_url, title, clicks, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase.rpc('get_overview_metrics', { p_user_id: user.id, p_start_date: thirtyDaysAgo.toISOString() }),
        supabase.rpc('get_device_stats', { p_user_id: user.id, p_start_date: thirtyDaysAgo.toISOString() }),
        supabase.rpc('get_country_stats', { p_user_id: user.id, p_start_date: thirtyDaysAgo.toISOString() })
      ]);

      if (analyticsResult.error) {
        console.error('Analytics fetch error:', analyticsResult.error);
        throw new Error(`Failed to fetch analytics data: ${analyticsResult.error.message}`);
      }

      if (shortenedLinksResult.error) {
        console.error('Shortened links fetch error:', shortenedLinksResult.error);
        throw new Error(`Failed to fetch links data: ${shortenedLinksResult.error.message}`);
      }

      const analyticsData = analyticsResult.data || [];
      const shortenedLinksData = shortenedLinksResult.data || [];

      console.log('Raw data counts:', {
        analytics: analyticsData.length,
        shortenedLinks: shortenedLinksData.length
      });

      // Filter analytics data by time periods with proper date validation
      const currentPeriodData = analyticsData.filter(item => {
        const itemDate = validateDate(item.created_at);
        return itemDate && itemDate >= thirtyDaysAgo;
      });

      const previousPeriodData = analyticsData.filter(item => {
        const itemDate = validateDate(item.created_at);
        return itemDate && itemDate >= sixtyDaysAgo && itemDate < thirtyDaysAgo;
      });

      console.log('Filtered data counts:', {
        currentPeriod: currentPeriodData.length,
        previousPeriod: previousPeriodData.length
      });

      // Overview via RPC with fallback
      let shortenedLinkClicks = 0;
      let profileViews = 0;
      if (!rpcOverview.error && rpcOverview.data) {
        const rows = Array.isArray(rpcOverview.data) ? rpcOverview.data : [rpcOverview.data];
        const o = rows[0] || {};
        shortenedLinkClicks = Number((o as any).total_clicks) || 0;
        profileViews = Number((o as any).total_views) || 0; // treat views as proxy for profile views
      } else {
        shortenedLinkClicks = currentPeriodData.filter(item => 
          item.event_type === 'click' && item.link_type === 'shortened_link'
        ).length;
        profileViews = currentPeriodData.filter(item => 
          item.event_type === 'view' && item.link_type === 'profile_link'
        ).length;
      }

      const totalClicksFromAnalytics = shortenedLinkClicks;

      // Calculate analytics events for comparison
      const currentAnalyticsEvents = currentPeriodData.length;
      const previousAnalyticsEvents = previousPeriodData.length;

      // Calculate percentage change with proper validation
      const percentageChange = calculatePercentageChange(currentAnalyticsEvents, previousAnalyticsEvents);

      console.log('Click calculations:', {
        shortenedLinkClicks,
        totalClicksFromAnalytics,
        currentAnalyticsEvents,
        previousAnalyticsEvents,
        percentageChange
      });

      // Top countries via RPC with fallback
      let topCountries: Array<{ country: string; visits: number }> = [];
      if (!rpcCountry.error && rpcCountry.data) {
        topCountries = (rpcCountry.data as any[])
          .map(r => ({ country: normalizeCountryCode(r.country_code || 'Unknown'), visits: validateNumber(r.visits) }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 5);
      } else {
        const countryVisits: Record<string, number> = {};
        currentPeriodData.forEach(item => {
          const country = normalizeCountryCode(item.country_code);
          countryVisits[country] = (countryVisits[country] || 0) + 1;
        });
        topCountries = Object.entries(countryVisits)
          .map(([country, visits]) => ({ country, visits: validateNumber(visits) }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 5);
      }

      console.log('Top countries:', topCountries);

      // Device split via RPC with fallback
      let deviceSplit = { mobile: 0, desktop: 0, tablet: 0 } as { mobile: number; desktop: number; tablet: number };
      if (!rpcDevices.error && rpcDevices.data) {
        const rows = rpcDevices.data as any[];
        const total = rows.reduce((s, r) => s + Number(r.device_count || 0), 0);
        const pct = (label: string) => total > 0 ? Math.round(((rows.find(r => (r.device_type || '').toLowerCase() === label)?.device_count || 0) / total) * 100) : 0;
        deviceSplit = {
          mobile: pct('mobile'),
          desktop: pct('desktop'),
          tablet: pct('tablet')
        };
      } else {
        const deviceCounts: Record<string, number> = {};
        currentPeriodData.forEach(item => {
          const device = normalizeDeviceType(item.device_type);
          deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        });
        const total = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
        deviceSplit = {
          mobile: total > 0 ? Math.round((validateNumber(deviceCounts.mobile) / total) * 100) : 0,
          desktop: total > 0 ? Math.round((validateNumber(deviceCounts.desktop) / total) * 100) : 0,
          tablet: total > 0 ? Math.round((validateNumber(deviceCounts.tablet) / total) * 100) : 0,
        };
      }

      // Ensure percentages add up to 100% (handle rounding errors)
      const totalPercentage = deviceSplit.mobile + deviceSplit.desktop + deviceSplit.tablet;
      if (totalPercentage !== 100 && (deviceSplit.mobile + deviceSplit.desktop + deviceSplit.tablet) > 0) {
        // Adjust the largest category to make it add up to 100%
        const largestCategory = Object.entries(deviceSplit).reduce((a, b) => 
          deviceSplit[a[0] as keyof typeof deviceSplit] > deviceSplit[b[0] as keyof typeof deviceSplit] ? a : b
        )[0] as keyof typeof deviceSplit;
        
        deviceSplit[largestCategory] += (100 - totalPercentage);
      }

      console.log('Device split:', deviceSplit);

      // Process links data with validation
      const links: Array<{ title: string; url: string; clicks: number }> = [];
      shortenedLinksData.forEach(link => {
        if (link.title && link.original_url) {
          links.push({
            title: link.title.trim(),
            url: link.original_url.trim(),
            clicks: validateNumber(link.clicks)
          });
        }
      });

      // Sort links by clicks (descending)
      links.sort((a, b) => b.clicks - a.clicks);

      console.log('Processed links:', links.length);

      // Create final data object with validation
      const dashboardData: DashboardData = {
        totalClicks: validateNumber(totalClicksFromAnalytics),
        shortenedLinkClicks: validateNumber(shortenedLinkClicks),
        profileViews: validateNumber(profileViews),
        percentageChange: validateNumber(percentageChange),
        topCountries,
        deviceSplit,
        links,
        lastFetch: Date.now()
      };

      console.log('Final dashboard data:', dashboardData);

      setData(dashboardData);
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
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

  const value = {
    data,
    isLoading,
    error,
    refetch
  };

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
};