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
  };
  
  lastFetch: number;
}

interface PremiumDashboardContextType {
  data: PremiumDashboardData | null;
  isLoading: boolean;
  error: string | null;
  timeFrame: string;
  setTimeFrame: (timeFrame: string) => void;
  refetch: () => Promise<void>;
}

const PremiumDashboardContext = createContext<PremiumDashboardContextType | undefined>(undefined);

export const usePremiumDashboardData = () => {
  const context = useContext(PremiumDashboardContext);
  if (context === undefined) {
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

  // Data validation helper functions
  const validateNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? fallback : Math.max(0, num);
  };

  const validateDate = (dateString: string): Date | null => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return num.toFixed(1) + '%';
  };

  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) {
      return current > 0 ? '+100.0%' : '0.0%';
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // Enhanced validation for analytics data
  const validateAnalyticsData = (data: any[]): any[] => {
    return data.filter(item => {
      // Ensure we have valid timestamps
      const date = validateDate(item.created_at);
      if (!date) return false;
      
      // Don't filter out records without hashed_ip - they might still be valid
      // Just ensure we have some basic data
      return true;
    });
  };

  const normalizeDeviceType = (deviceType: string | null | undefined): string => {
    if (!deviceType) return 'Unknown';
    
    const normalized = deviceType.toLowerCase().trim();
    
    if (normalized.includes('mobile') || normalized.includes('phone') || normalized.includes('android') || normalized.includes('iphone')) {
      return 'Mobile';
    }
    if (normalized.includes('desktop') || normalized.includes('pc') || normalized.includes('mac') || normalized.includes('windows')) {
      return 'Desktop';
    }
    if (normalized.includes('tablet') || normalized.includes('ipad')) {
      return 'Tablet';
    }
    
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const normalizeBrowser = (browser: string | null | undefined): string => {
    if (!browser) return 'Unknown';
    
    const normalized = browser.toLowerCase().trim();
    
    // Map common browser variations
    if (normalized.includes('chrome')) return 'Chrome';
    if (normalized.includes('firefox')) return 'Firefox';
    if (normalized.includes('safari')) return 'Safari';
    if (normalized.includes('edge')) return 'Edge';
    if (normalized.includes('opera')) return 'Opera';
    if (normalized.includes('internet explorer') || normalized.includes('ie')) return 'Internet Explorer';
    
    return browser.charAt(0).toUpperCase() + browser.slice(1);
  };

  const normalizeCountryCode = (countryCode: string | null | undefined): string => {
    if (!countryCode) return 'Unknown';
    
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

      // Calculate date range based on timeFrame with proper timezone handling
      const now = new Date();
      let startDate = new Date();
      
      if (timeFrame === "7days") {
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      } else if (timeFrame === "30days") {
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      } else if (timeFrame === "90days") {
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
      }
      
      const startDateStr = startDate.toISOString();

      console.log('Premium Dashboard - Fetching data for user:', user.id);
      console.log('Time frame:', timeFrame, 'Start date:', startDateStr);

      // Batch fetch all analytics data with proper error handling
      const [analyticsResult, profileViewsResult, shortenedLinksResult] = await Promise.all([
        supabase
          .from('link_analytics')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDateStr)
          .order('created_at', { ascending: false }),
        supabase
          .from('profile_views')
          .select('*')
          .eq('profile_id', user.id)
          .gte('viewed_at', startDateStr)
          .order('viewed_at', { ascending: false }),
        supabase
          .from('shortened_links')
          .select('id, clicks, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gte('created_at', startDateStr)
      ]);

      if (analyticsResult.error) {
        console.error('Analytics fetch error:', analyticsResult.error);
        throw new Error(`Failed to fetch analytics data: ${analyticsResult.error.message}`);
      }

      if (profileViewsResult.error) {
        console.error('Profile views fetch error:', profileViewsResult.error);
        throw new Error(`Failed to fetch profile views data: ${profileViewsResult.error.message}`);
      }

      if (shortenedLinksResult.error) {
        console.error('Shortened links fetch error:', shortenedLinksResult.error);
        throw new Error(`Failed to fetch links data: ${shortenedLinksResult.error.message}`);
      }

      const analyticsData = validateAnalyticsData(analyticsResult.data || []);
      const profileViewsData = profileViewsResult.data || [];
      const shortenedLinksData = shortenedLinksResult.data || [];

      console.log('Premium Dashboard - Raw data counts:', {
        analytics: analyticsData.length,
        profileViews: profileViewsData.length,
        shortenedLinks: shortenedLinksData.length
      });

      // Debug unique visitors calculation
      const visitorIdentifiers = analyticsData.map(item => item.hashed_ip || `anonymous_${item.id}`);
      const uniqueVisitorSet = new Set(visitorIdentifiers.filter(id => id && id.trim() !== ''));
      
      console.log('Unique visitors debug:', {
        totalAnalytics: analyticsData.length,
        visitorIdentifiers: visitorIdentifiers.slice(0, 5), // Show first 5
        uniqueCount: uniqueVisitorSet.size,
        hashedIpCount: analyticsData.filter(item => item.hashed_ip).length
      });

      // Calculate previous period for comparison - FIXED LOGIC
      const periodDuration = now.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodDuration);
      const previousEndDate = startDate;
      
      // Fetch previous period data separately
      const previousAnalyticsResult = await supabase
        .from('link_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', previousEndDate.toISOString())
        .order('created_at', { ascending: false });

      const previousAnalyticsData = validateAnalyticsData(previousAnalyticsResult.data || []);

      // Process Overview Data - FIXED LOGIC
      // Calculate clicks from analytics data (only click events)
      const totalClicks = analyticsData.filter(item => item.event_type === 'click').length;
      const previousTotalClicks = previousAnalyticsData.filter(item => item.event_type === 'click').length;
      
      // Calculate views from analytics data (only view events)
      const totalViews = analyticsData.filter(item => item.event_type === 'view').length;
      const previousTotalViews = previousAnalyticsData.filter(item => item.event_type === 'view').length;
      
      // Calculate unique visitors from analytics data using hashed_ip or fallback
      const uniqueVisitors = new Set(
        analyticsData
          .map(item => item.hashed_ip || `anonymous_${item.id}`)
          .filter(identifier => identifier && identifier.trim() !== '')
      ).size;
      
      const previousUniqueVisitors = new Set(
        previousAnalyticsData
          .map(item => item.hashed_ip || `anonymous_${item.id}`)
          .filter(identifier => identifier && identifier.trim() !== '')
      ).size;
      
      // Calculate conversion rate (clicks per view) - CAP AT 100%
      const conversionRate = totalViews > 0 ? Math.min((totalClicks / totalViews) * 100, 100) : 0;
      const previousConversionRate = previousTotalViews > 0 ? Math.min((previousTotalClicks / previousTotalViews) * 100, 100) : 0;
      
      // Calculate average time (mock data for now - would need session data)
      const avgTime = '2m 34s';

      const overview = {
        totalClicks: formatNumber(totalClicks),
        uniqueVisitors: formatNumber(uniqueVisitors),
        conversionRate: formatPercentage(conversionRate),
        avgTime,
        totalViews: formatNumber(totalViews),
        changes: {
          clicks: calculatePercentageChange(totalClicks, previousTotalClicks),
          visitors: calculatePercentageChange(uniqueVisitors, previousUniqueVisitors),
          conversion: calculatePercentageChange(conversionRate, previousConversionRate),
          time: '+10.0%', // Mock data
          views: calculatePercentageChange(totalViews, previousTotalViews)
        }
      };

      // Process Geography Data
      const countryCounts: Record<string, number> = {};
      const heatmapData: Array<[number, number, number]> = [];
      
      analyticsData.forEach(item => {
        const country = normalizeCountryCode(item.country_code);
        countryCounts[country] = (countryCounts[country] || 0) + 1;
        
        // Add to heatmap if we have coordinates
        if (item.lat && item.lng) {
          heatmapData.push([validateNumber(item.lat), validateNumber(item.lng), 1]);
        }
      });

      const totalCountryVisits = Object.values(countryCounts).reduce((a, b) => a + b, 0);
      const countryStats = Object.entries(countryCounts)
        .map(([country, visits]) => ({
          country,
          visits: validateNumber(visits),
          percentage: totalCountryVisits > 0 ? Math.round((visits / totalCountryVisits) * 100) : 0
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      const geography = {
        heatmapData,
        countryStats,
        analyticsData: analyticsData.slice(0, 100) // Limit for performance
      };

      // Process Devices Data
      const deviceCounts: Record<string, number> = {};
      const browserCounts: Record<string, number> = {};
      
      analyticsData.forEach(item => {
        const device = normalizeDeviceType(item.device_type);
        const browser = normalizeBrowser(item.browser);
        
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });

      const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
      const totalBrowsers = Object.values(browserCounts).reduce((a, b) => a + b, 0);

      const deviceStats = Object.entries(deviceCounts)
        .map(([type, count]) => ({
          type,
          count: validateNumber(count),
          percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      const browserStats = Object.entries(browserCounts)
        .map(([browser, count]) => ({
          browser,
          count: validateNumber(count),
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

      // Group by day - use analytics data for both clicks and views
      const dailyGroups: Record<string, { clicks: number; views: number }> = {};
      
      // FIXED: Properly distinguish between clicks and views based on event_type
      analyticsData.forEach(item => {
        const date = item.created_at.split('T')[0];
        dailyGroups[date] = (dailyGroups[date] || { clicks: 0, views: 0 });
        
        // Only count as click if it's actually a click event
        if (item.event_type === 'click') {
          dailyGroups[date].clicks++;
        }
        
        // Only count as view if it's actually a view event
        if (item.event_type === 'view') {
          dailyGroups[date].views++;
        }
      });

      // Convert to arrays and sort by date
      Object.entries(dailyGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, data]) => {
          dailyData.push({
            date,
            clicks: validateNumber(data.clicks),
            views: validateNumber(data.views)
          });
        });

      const trends = {
        dailyData
      };

      // Create final data object
      const premiumDashboardData: PremiumDashboardData = {
        overview,
        geography,
        devices,
        trends,
        lastFetch: Date.now()
      };

      console.log('Premium Dashboard - Final data:', premiumDashboardData);

      setData(premiumDashboardData);
    } catch (err: any) {
      console.error('Premium Dashboard data fetch error:', err);
      setError(err.message || 'Failed to load premium dashboard data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame]);

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
    timeFrame,
    setTimeFrame,
    refetch
  };

  return (
    <PremiumDashboardContext.Provider value={value}>
      {children}
    </PremiumDashboardContext.Provider>
  );
};