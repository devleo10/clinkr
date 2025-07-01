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
import DashboardBackground from '../DashboardBackground';

const PremiumDashBoard = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('link_analytics')
        .select('*')
        .eq('profile_id', user.id);

      if (analyticsError) throw analyticsError;

      // Fetch profile views data
      const { data: profileViewsData, error: profileViewsError } = await supabase
        .from('profile_views')
        .select('*')
        .eq('profile_id', user.id);

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
    } catch (error) {
      console.error('Export failed:', error);
      // Optionally show an error toast here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative"
    >
      <DashboardBackground />
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Heading and Export Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl shadow-lg hover:shadow-xl mb-8 relative overflow-hidden"
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
          
          {/* Animated accent */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          {/* Premium Analytics Heading */}
          <div className="flex flex-col items-center mb-6 relative z-10">
            <motion.h1 
              className="font-extrabold text-2xl sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-center"
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Premium Analytics
            </motion.h1>
            <motion.div 
              className="h-1 w-24 mt-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '6rem' }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            
            {/* Export Button */}
            <div className="flex justify-center mt-6 w-full relative z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 text-white transition-all duration-300 shadow-lg border border-white/20"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
                    }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isExporting}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <span className="font-bold">{isExporting ? 'Exporting...' : 'Export Data'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/90 backdrop-blur-md border border-indigo-100 shadow-lg rounded-lg p-1">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DropdownMenuItem 
                      onClick={() => handleExport('pdf')}
                      className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 cursor-pointer transition-colors rounded-md p-2 m-1 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExport('csv')}
                      className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 cursor-pointer transition-colors rounded-md p-2 m-1 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Export as CSV
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl shadow-lg hover:shadow-xl relative overflow-hidden"
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
          
          {/* Animated flowing gradient line on top */}
          <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
              animate={{
                x: ["0%", "100%"],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
            <motion.div
              className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 rounded-bl-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
          </div>
          <div className="relative z-10">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 gap-2 mb-6 bg-white/80 backdrop-blur-lg p-1 rounded-lg shadow-md border border-white/30">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-md transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 data-[state=active]:shadow-lg"
                >
                  <motion.span
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -1 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Overview
                  </motion.span>
                </TabsTrigger>
                <TabsTrigger 
                  value="geography" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-md transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 data-[state=active]:shadow-lg"
                >
                  <motion.span
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -1 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Geography
                  </motion.span>
                </TabsTrigger>
                <TabsTrigger 
                  value="devices" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-md transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 data-[state=active]:shadow-lg"
                >
                  <motion.span
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -1 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Devices
                  </motion.span>
                </TabsTrigger>
                <TabsTrigger 
                  value="trends" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-md transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 data-[state=active]:shadow-lg"
                >
                  <motion.span
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -1 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Trends
                  </motion.span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <Overview/>
                </motion.div>
              </TabsContent>
              <TabsContent value="geography" className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <Geography/>
                </motion.div>
              </TabsContent>
              <TabsContent value="devices" className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <Devices/>
                </motion.div>
              </TabsContent>
              <TabsContent value="trends" className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <Trends/>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PremiumDashBoard;
