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
  
  // Conversions (new)
  conversions?: {
    totalConversions: number;
    byType: Array<{ event_type: string; count: number; percentage: number }>;
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

      // Batch fetch: minimal rows + RPC aggregates (DB-side)
      const [analyticsResult, profileViewsResult, shortenedLinksResult, conversionsResult, rpcOverview, rpcDevices, rpcBrowsers, rpcTrends, rpcCountryStats, rpcHeatmap, rpcGeoPoints] = await Promise.all([
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
          .gte('created_at', startDateStr),
        supabase
          .from('conversion_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDateStr),
        // RPC functions (create in DB per analytics.md)
        supabase.rpc('get_overview_metrics', { p_user_id: user.id, p_start_date: startDateStr }),
        supabase.rpc('get_device_stats', { p_user_id: user.id, p_start_date: startDateStr }),
        supabase.rpc('get_browser_stats', { p_user_id: user.id, p_start_date: startDateStr }),
        supabase.rpc('get_daily_trends', { p_user_id: user.id, p_start_date: startDateStr }),
        // New RPCs for geography
        supabase.rpc('get_country_stats', { p_user_id: user.id, p_start_date: startDateStr }),
        supabase.rpc('get_heatmap_data', { p_user_id: user.id, p_start_date: startDateStr }),
        supabase.rpc('get_geography_points', { p_user_id: user.id, p_start_date: startDateStr })
      ]);

      if (analyticsResult.error) {
        throw new Error(`Failed to fetch analytics data: ${analyticsResult.error.message}`);
      }

      if (profileViewsResult.error) {
        throw new Error(`Failed to fetch profile views data: ${profileViewsResult.error.message}`);
      }

      if (shortenedLinksResult.error) {
        throw new Error(`Failed to fetch links data: ${shortenedLinksResult.error.message}`);
      }
      if (conversionsResult.error) {
        throw new Error(`Failed to fetch conversion events: ${conversionsResult.error.message}`);
      }

      const analyticsData = validateAnalyticsData(analyticsResult.data || []);
      const profileViewsData = profileViewsResult.data || [];
      const shortenedLinksData = shortenedLinksResult.data || [];
      const conversionEvents = conversionsResult.data || [];

      // Debug unique visitors calculation
      const visitorIdentifiers = analyticsData.map(item => item.hashed_ip || `anonymous_${item.id}`);
      const uniqueVisitorSet = new Set(visitorIdentifiers.filter(id => id && id.trim() !== ''));

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
      // Also fetch previous conversions for accurate conversion rate comparison
      const prevConversionsRes = await supabase
        .from('conversion_events')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', previousEndDate.toISOString());
      const previousConversionsCountFromTable = (prevConversionsRes.error ? 0 : (prevConversionsRes.data || []).length) as number;
      const previousConversionsCountFromAnalytics = previousAnalyticsData.filter(item => item.event_type === 'conversion').length;
      const previousConversionsCount = previousConversionsCountFromTable > 0 ? previousConversionsCountFromTable : previousConversionsCountFromAnalytics;

      // Prefer RPC overview (DB aggregation). Fallback to client calc if RPC fails
      let totalClicks = 0;
      let previousTotalClicks = previousAnalyticsData.filter(item => item.event_type === 'click').length;
      let totalViews = 0;
      let previousTotalViews = previousAnalyticsData.filter(item => item.event_type === 'view').length;
      let uniqueVisitors = 0;
      let previousUniqueVisitors = new Set(
        previousAnalyticsData.map(item => item.hashed_ip || `anonymous_${item.id}`).filter(Boolean)
      ).size;
      let avgSeconds = 0;
      if (!rpcOverview.error && rpcOverview.data) {
        const rows = Array.isArray(rpcOverview.data) ? rpcOverview.data : [rpcOverview.data];
        const o = rows[0] || {};
        totalClicks = Number((o as any).total_clicks) || 0;
        totalViews = Number((o as any).total_views) || 0;
        uniqueVisitors = Number((o as any).unique_visitors) || 0;
        avgSeconds = Number((o as any).avg_time_seconds) || 0;
      } else {
        totalClicks = analyticsData.filter(item => item.event_type === 'click').length;
        totalViews = analyticsData.filter(item => item.event_type === 'view').length;
        uniqueVisitors = new Set(
          analyticsData.map(item => item.hashed_ip || `anonymous_${item.id}`).filter(Boolean)
        ).size;
        const durations = analyticsData
          .map(item => Number(item.duration_seconds))
          .filter(v => Number.isFinite(v) && v > 0);
        avgSeconds = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
      }
      const minutes = Math.floor(avgSeconds / 60);
      const seconds = avgSeconds % 60;
      const avgTime = avgSeconds > 0 ? `${minutes}m ${seconds}s` : '—';
      // Conversion rate: prefer conversion_events; fallback to analytics rows with event_type='conversion'
      const conversionsCountFromTable = (conversionEvents || []).length;
      const conversionsCountFromAnalytics = analyticsData.filter(item => item.event_type === 'conversion').length;
      const conversionsCount = conversionsCountFromTable > 0 ? conversionsCountFromTable : conversionsCountFromAnalytics;
      const conversionRate = totalViews > 0 ? Math.min((conversionsCount / totalViews) * 100, 100) : 0;
      const previousConversionRate = previousTotalViews > 0 ? Math.min((previousConversionsCount / previousTotalViews) * 100, 100) : 0;

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

      // Geography via RPCs with fallback
      let countryStats: Array<{ country: string; visits: number; percentage: number }> = [];
      let heatmapData: Array<[number, number, number]> = [];
      let geoPoints: Array<any> = [];
      if (!rpcCountryStats.error && rpcCountryStats.data) {
        const rows = rpcCountryStats.data as any[];
        const total = rows.reduce((s, r) => s + Number(r.visits || 0), 0);
        countryStats = rows.map(r => ({
          country: normalizeCountryCode(r.country_code || 'Unknown'),
          visits: validateNumber(r.visits),
          percentage: total > 0 ? Math.round((Number(r.visits) / total) * 100) : 0
        })).sort((a, b) => b.visits - a.visits).slice(0, 10);
      } else {
        const countryCounts: Record<string, number> = {};
        analyticsData.forEach(item => {
          const country = normalizeCountryCode(item.country_code);
          countryCounts[country] = (countryCounts[country] || 0) + 1;
        });
        const total = Object.values(countryCounts).reduce((a, b) => a + b, 0);
        countryStats = Object.entries(countryCounts)
          .map(([country, visits]) => ({
            country,
            visits: validateNumber(visits),
            percentage: total > 0 ? Math.round((visits / total) * 100) : 0
          }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 10);
      }

      if (!rpcHeatmap.error && rpcHeatmap.data) {
        heatmapData = (rpcHeatmap.data as any[]).map(r => [validateNumber(r.lat), validateNumber(r.lng), validateNumber(r.intensity || 1)]) as Array<[number, number, number]>;
      } else {
        analyticsData.forEach(item => {
          if (item.lat && item.lng) {
            heatmapData.push([validateNumber(item.lat), validateNumber(item.lng), 1]);
          }
        });
      }

      if (!rpcGeoPoints.error && rpcGeoPoints.data) {
        geoPoints = rpcGeoPoints.data as any[];
      } else {
        geoPoints = analyticsData.slice(0, 100);
      }

      const geography = {
        heatmapData,
        countryStats,
        analyticsData: geoPoints
      };

      // Devices & Browsers via RPC with fallback
      let deviceStats: Array<{ type: string; count: number; percentage: number }> = [];
      let browserStats: Array<{ browser: string; count: number; percentage: number }> = [];
      if (!rpcDevices.error && rpcDevices.data) {
        const rows = (rpcDevices.data as any[]) || [];
        const total = rows.reduce((s, r) => s + Number(r.device_count || 0), 0);
        deviceStats = rows.map(r => ({
          type: String(r.device_type || 'Unknown'),
          count: validateNumber(r.device_count),
          percentage: total > 0 ? Math.round((Number(r.device_count) / total) * 100) : 0
        }));
      } else {
        const counts: Record<string, number> = {};
        analyticsData.forEach(item => {
          const device = normalizeDeviceType(item.device_type);
          counts[device] = (counts[device] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        deviceStats = Object.entries(counts).map(([type, count]) => ({
          type,
          count: validateNumber(count),
          percentage: total > 0 ? Math.round((Number(count) / total) * 100) : 0
        }));
      }
      if (!rpcBrowsers.error && rpcBrowsers.data) {
        const rows = (rpcBrowsers.data as any[]) || [];
        const total = rows.reduce((s, r) => s + Number(r.browser_count || 0), 0);
        browserStats = rows.map(r => ({
          browser: String(r.browser || 'Unknown'),
          count: validateNumber(r.browser_count),
          percentage: total > 0 ? Math.round((Number(r.browser_count) / total) * 100) : 0
        })).slice(0, 10);
      } else {
        const counts: Record<string, number> = {};
        analyticsData.forEach(item => {
          const b = normalizeBrowser(item.browser);
          counts[b] = (counts[b] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        browserStats = Object.entries(counts).map(([browser, count]) => ({
          browser,
          count: validateNumber(count),
          percentage: total > 0 ? Math.round((Number(count) / total) * 100) : 0
        })).sort((a, b) => b.count - a.count).slice(0, 10);
      }

      const devices = {
        deviceStats,
        browserStats
      };

      // Trends via RPC with fallback
      let dailyData: Array<{ date: string; clicks: number; views: number }> = [];
      if (!rpcTrends.error && rpcTrends.data) {
        dailyData = (rpcTrends.data as any[]).map(row => ({
          date: row.day,
          clicks: validateNumber(row.clicks),
          views: validateNumber(row.views)
        }));
      } else {
        const dailyGroups: Record<string, { clicks: number; views: number }> = {};
        analyticsData.forEach(item => {
          const date = item.created_at.split('T')[0];
          dailyGroups[date] = (dailyGroups[date] || { clicks: 0, views: 0 });
          if (item.event_type === 'click') dailyGroups[date].clicks++;
          if (item.event_type === 'view') dailyGroups[date].views++;
        });
        Object.entries(dailyGroups)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([date, data]) => {
            dailyData.push({
              date,
              clicks: validateNumber(data.clicks),
              views: validateNumber(data.views)
            });
          });
      }

      const trends = {
        dailyData
      };

      // Process Conversions Aggregation
      const convCounts: Record<string, number> = {};
      conversionEvents.forEach((e: any) => {
        const key = (e.event_type || 'unknown').toString();
        convCounts[key] = (convCounts[key] || 0) + 1;
      });
      const totalConversions = Object.values(convCounts).reduce((a, b) => a + b, 0);
      const byType = Object.entries(convCounts)
        .map(([event_type, count]) => ({
          event_type,
          count: validateNumber(count),
          percentage: totalConversions > 0 ? Math.round((count / totalConversions) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Create final data object
      const premiumDashboardData: PremiumDashboardData = {
        overview,
        geography,
        devices,
        trends,
        conversions: {
          totalConversions,
          byType
        },
        lastFetch: Date.now()
      };

      setData(premiumDashboardData);
    } catch (err: any) {
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