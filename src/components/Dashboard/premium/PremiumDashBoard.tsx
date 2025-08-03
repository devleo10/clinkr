import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import BoltBackground from '../../homepage/BoltBackground';

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

      toast.success(`Successfully exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
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
      <Toaster position="top-center" />
      <BoltBackground />
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Heading and Export Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card bg-white/90 backdrop-blur-lg border border-white/30 p-6 rounded-xl shadow-lg hover:shadow-xl mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
          
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <div className="flex flex-col items-center mb-6 relative z-10">
            <motion.h1 
              className="font-extrabold text-3xl sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-center tracking-tight"
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
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mt-2 text-center"
            >
              Detailed insights and advanced analytics for your links
            </motion.p>
            <motion.div 
              className="h-1 w-32 mt-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '8rem' }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            
            <div className="flex justify-center gap-4 mt-6 w-full relative z-10">
              <Link to="/dashboard">
                <motion.button
                  className="flex items-center space-x-3 px-6 py-3 rounded-xl bg-white/90 hover:bg-white text-indigo-600 transition-all duration-300 shadow-lg border border-indigo-100 backdrop-blur-sm"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.2)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <span className="font-bold">Visit Dashboard</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="flex items-center space-x-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 text-white transition-all duration-300 shadow-lg border border-white/20"
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
                    {isExporting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-bold">Exporting...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">Export Analytics</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-md border border-indigo-100 shadow-xl rounded-lg p-2 w-48">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DropdownMenuItem 
                      onClick={() => handleExport('pdf')}
                      className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 cursor-pointer transition-colors rounded-md p-3 m-1 flex items-center group"
                    >
                      <svg className="w-5 h-5 mr-3 text-indigo-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium">PDF Export</div>
                        <div className="text-xs text-gray-500">High-quality report</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExport('csv')}
                      className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 cursor-pointer transition-colors rounded-md p-3 m-1 flex items-center group"
                    >
                      <svg className="w-5 h-5 mr-3 text-indigo-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium">CSV Export</div>
                        <div className="text-xs text-gray-500">Raw data format</div>
                      </div>
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
          
       
          
          <div className="relative z-10">
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className='flex justify-between items-center bg-inherit px-0 w-full max-w-full'>
                {tabs.map(tab => (
                  <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md data-[state=active]:shadow-lg py-2.5 px-3 flex-shrink-0 text-xs sm:text-sm md:text-base min-w-0 flex-1"
                  >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-0 rounded-lg transition-opacity"
                    initial={false}
                  />
                  <motion.span
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -1 }}
                    className="flex items-center gap-1.5 sm:gap-1.5 relative z-10 justify-center flex-col sm:flex-row"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    <span className="font-medium truncate text-center">{tab.label}</span>
                  </motion.span>
                  </TabsTrigger>
                ))}
                </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="overview" className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Overview />
                  </motion.div>
                </TabsContent>
                <TabsContent value="geography" className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Geography />
                  </motion.div>
                </TabsContent>
                <TabsContent value="devices" className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Devices />
                  </motion.div>
                </TabsContent>
                <TabsContent value="trends" className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Trends />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PremiumDashBoard;
