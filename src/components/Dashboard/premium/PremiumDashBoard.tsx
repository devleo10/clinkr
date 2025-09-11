import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import Overview from './overview/Overview';
import Geography from './geography/Geography';
import Devices from './devices/Devices';
import Trends from './trends/Trends';
import { exportToPDF, exportToCSV } from '../../../lib/export-service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '../Navbar';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import BoltBackground from '../../homepage/BoltBackground';
import { FaChartLine } from 'react-icons/fa';
import LoadingScreen from '../../ui/loadingScreen';
import { PremiumDashboardProvider } from './PremiumDashboardContext';

interface TabConfig {
  value: string;
  icon: string;
  label: string;
}

const PremiumDashBoard = () => {
  const [isExporting, setIsExporting] = useState(false);

  const tabs: TabConfig[] = [
    { 
      value: 'overview', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      label: 'Overview'
    },
    {
      value: 'geography',
      icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      label: 'Geography'
    },
    {
      value: 'devices',
      icon: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      label: 'Devices'
    },
    {
      value: 'trends',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      label: 'Trends'
    }
  ];

  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    toast.loading(`Preparing ${format.toUpperCase()} export...`);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('link_analytics')
        .select('*')
        .eq('user_id', user.id);

      if (analyticsError) throw analyticsError;

      // Fetch profile views data
      const { data: profileViewsData, error: profileViewsError } = await supabase
        .from('profile_views')
        .select('*')
        .eq('user_id', user.id);

      if (profileViewsError) throw profileViewsError;

      // Calculate overview stats
     
      const totalViews = profileViewsData.length;

      // Geography aggregation
      const countryVisits: Record<string, number> = {};
      analyticsData.forEach(item => {
        const country = item.country_code || 'Unknown';
        countryVisits[country] = (countryVisits[country] || 0) + 1;
      });
      const geography = Object.entries(countryVisits).map(([country, visits]) => ({ country, visits }));

      // Devices aggregation
      const deviceCounts: Record<string, number> = {};
      analyticsData.forEach(item => {
        const device = item.device_type || 'Unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      const totalDeviceCount = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
      const devices = Object.entries(deviceCounts).map(([type, count]) => ({
        type,
        percentage: totalDeviceCount ? Math.round((count / totalDeviceCount) * 100) : 0,
      }));

      // Trends aggregation (example: monthly views for last 3 months)
      const now = new Date();
      const trends = [0, 1, 2].map(offset => {
        const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const monthStr = month.toISOString().slice(0, 7);
        const views = analyticsData.filter(item =>
          item.created_at &&
          item.created_at.startsWith(monthStr)
        ).length;
        return { date: monthStr, views };
      }).reverse();

      // Compose export data
      const data = {
        overview: {
          totalViews,
          change: '+0%', // You can calculate real change if you want
        },
        geography,
        devices,
        trends,
      };

      if (format === 'pdf') {
        await exportToPDF(data);
      } else {
        await exportToCSV(data);
      }

      toast.success(`Successfully exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PremiumDashboardProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen relative"
      >
        <BoltBackground />
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div
          className="glass-card bg-white/80 backdrop-blur-lg border border-orange-100 p-6 rounded-xl shadow-lg mb-8 relative overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100 opacity-70"></div>
          {/* Animated accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400" />
          {/* Corner decoration */}
          <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-300 rounded-bl-full" />
          </div>
          {/* Analytics Dashboard Heading */}
          <div className="flex flex-col items-center mb-6 relative z-10">
            <div className="flex items-center justify-center">
              <div className="mr-3 p-2 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 shadow-md">
                <FaChartLine size={24} className="text-orange-500" />
              </div>
              <h1 className="font-extrabold text-2xl sm:text-3xl text-black text-center">
                Premium Analytics
              </h1>
            </div>
            <div className="h-1 w-24 mt-2 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 rounded-full shadow-sm" />
            <p className="text-black mt-2 max-w-md text-center text-sm">
              Unlock advanced insights and trends for your links
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center space-x-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 hover:from-orange-400 hover:via-amber-500 hover:to-orange-400 text-white transition-all duration-200 shadow-lg border border-white/20"
                  disabled={isExporting}
                >
                    {isExporting ? (
                      <>
                        <div className="flex items-center gap-2">
                          <LoadingScreen compact message="" />
                          <span className="font-bold">Exporting...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">Export Analytics</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </>
                    )}
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-md border border-orange-100 shadow-xl rounded-lg p-2 w-48">
                  <div>
                    <DropdownMenuItem 
                      onClick={() => handleExport('pdf')}
                      className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 cursor-pointer transition-colors rounded-md p-3 m-1 flex items-center group"
                    >
                      <svg className="w-5 h-5 mr-3 text-orange-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium">PDF Export</div>
                        <div className="text-xs text-black">High-quality report</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExport('csv')}
                      className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 cursor-pointer transition-colors rounded-md p-3 m-1 flex items-center group"
                    >
                      <svg className="w-5 h-5 mr-3 text-orange-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium">CSV Export</div>
                        <div className="text-xs text-black">Raw data format</div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>

        {/* Tabs Section */}
        <div
          className="glass-card bg-white/80 backdrop-blur-lg border border-orange-100 p-6 rounded-xl shadow-lg relative overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100 opacity-70"></div>
          
          {/* Animated flowing gradient line on top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400" />
          
       
          
          <div className="relative z-10">
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className='flex justify-between items-center bg-inherit px-0 w-full max-w-full'>
                {tabs.map(tab => (
                  <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="relative group text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:via-amber-500 data-[state=active]:to-orange-400 data-[state=active]:text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md data-[state=active]:shadow-lg py-2.5 px-3 flex-shrink-0 text-xs sm:text-sm md:text-base min-w-0 flex-1"
                  >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-0 rounded-lg transition-opacity"
                    initial={false}
                  />
                  <span className="flex items-center gap-1.5 sm:gap-1.5 relative z-10 justify-center flex-col sm:flex-row">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    <span className="font-medium truncate text-center">{tab.label}</span>
                  </span>
                  </TabsTrigger>
                ))}
                </TabsList>

              <TabsContent value="overview" className="relative z-10">
                <Overview />
              </TabsContent>
              <TabsContent value="geography" className="relative z-10">
                <Geography />
              </TabsContent>
              <TabsContent value="devices" className="relative z-10">
                <Devices />
              </TabsContent>
              <TabsContent value="trends" className="relative z-10">
                <Trends />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </motion.div>
    </PremiumDashboardProvider>
  );
};

export default PremiumDashBoard;
