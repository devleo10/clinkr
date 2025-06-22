import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { LayoutDashboard  } from "lucide-react";
import { Link } from 'react-router-dom';
import logo from "../../../assets/Frame.png"
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



const PremiumDashBoard = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [deviceData] = useState([
    { type: 'Desktop', percentage: 65 },
    { type: 'Mobile', percentage: 30 },
    { type: 'Tablet', percentage: 5 }
  ]);
  const [viewTrends] = useState({
    total: 98432,
    growth: 22,
    dailyAverage: 3281,
    peakTime: "2-4 PM"
  });

  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      // Collect actual data from components
      const data = {
        overview: {
          totalClicks: viewTrends.total,
          uniqueVisitors: deviceData.reduce((acc, device) => acc + device.percentage, 0),
          conversionRate: deviceData[2].percentage,
          avgTime: viewTrends.peakTime,
          totalViews: viewTrends.total,
          changes: { clicks: '+12.3%', visitors: '+8.7%', conversion: '-1.4%', time: '+0.8%', views: `+${viewTrends.growth}%` },
          change: `+${viewTrends.growth}%`
        },
        geography: [
          { country: 'USA', visits: 2104 },
          { country: 'India', visits: 892 },
          { country: 'UK', visits: 654 }
        ],
        devices: deviceData,
        trends: [
          { date: new Date().toISOString().slice(0, 7), views: viewTrends.total },
          { date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7), views: Math.round(viewTrends.total / (1 + viewTrends.growth/100)) },
          { date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString().slice(0, 7), views: Math.round(viewTrends.total / (1 + viewTrends.growth/100) * 0.9) }
        ]
      };

      if (format === 'pdf') {
        await exportToPDF(data);
      } else {
        await exportToCSV(data);
      }
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to show an error toast here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Link to="/homepage" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="Clinkr Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10"
            />
            <h1 className="text-2xl md:text-3xl font-extrabold relative group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300">
                Clinkr
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 group-hover:w-full transition-all duration-300"></div>
            </h1>
          </Link>
          <Link to="/privateprofile">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-5 py-2 rounded-lg shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300"
            >
              <LayoutDashboard size={18} />
              <span>Go Back to Profile</span>
            </Button>
          </Link>
        </div>

        {/* Centered Premium Analytics Heading */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="font-bold text-2xl sm:text-3xl text-gray-800 text-center">
            Premium Analytics
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1 text-center">
            Last updated: April 21, 2025 11:30 AM
          </p>
        </div>

        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-5 py-2 rounded-lg shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300"
                disabled={isExporting}
              >
                <span className="mr-2">{isExporting ? 'Exporting...' : 'Export Data'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 gap-2 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview/>
        </TabsContent>
        <TabsContent value="geography">
          <Geography/>
        </TabsContent>
        <TabsContent value="devices">
          <Devices/>
        </TabsContent>
        <TabsContent value="trends">
          <Trends/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumDashBoard;
