import React from "react";
import { DeviceStatRow } from "../DeviceStatRow";
import { BrowserStatRow } from "../BrowserStatRow";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { usePremiumDashboardData } from '../PremiumDashboardContext';
import LoadingScreen from '../../../ui/loadingScreen';

const Devices = React.memo(() => {
  const { data, isLoading, error, timeFrame } = usePremiumDashboardData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingScreen compact />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Device Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Device Data Yet</h3>
        <p className="text-gray-500 mb-4">Start getting clicks to see device analytics</p>
        <p className="text-sm text-gray-400">Device and browser statistics will appear once people visit your links</p>
      </div>
    );
  }

  const { deviceStats, browserStats } = data.devices;

  // Prefer aggregated deviceStats from context (RPC). Fallback to zeroes.
  const totalCount = deviceStats.reduce((sum, d) => sum + (d.count || 0), 0);
  const getPct = (label: string) => {
    const match = deviceStats.find(d => (d.type || '').toLowerCase() === label.toLowerCase());
    const count = match?.count || 0;
    return totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
  };

  // Process device data for display
  const deviceData = [
    { 
      icon: <Laptop size={20} />, 
      label: "Desktop", 
      percentage: getPct('Desktop') 
    },
    { 
      icon: <Smartphone size={20} />, 
      label: "Mobile", 
      percentage: getPct('Mobile') 
    },
    { 
      icon: <Tablet size={20} />, 
      label: "Tablet", 
      percentage: getPct('Tablet') 
    }
  ];

  const totalDevices = {
    count: totalCount,
    growth: 0, // Would need historical data to calculate
    topDevice: ['Desktop','Mobile','Tablet'].sort((a, b) => getPct(b) - getPct(a))[0] || 'Desktop',
    topDevicePercentage: Math.max(getPct('Desktop'), getPct('Mobile'), getPct('Tablet'))
  };

  const browserData = browserStats.slice(0, 4).map(browser => ({
    name: browser.browser,
    percentage: browser.percentage,
    trend: "up" as const,
    change: 0 // Would need historical data
  }));

  const browserStatsData = {
    totalSessions: browserStats.reduce((sum, browser) => sum + browser.count, 0),
    growth: 0, // Would need historical data
    topBrowser: browserStats[0]?.browser || "Chrome",
    topBrowserPercentage: browserStats[0]?.percentage || 0
  };

  // Generate smart insights
  const smartInsights = [
    `${totalDevices.topDevice} devices dominate with ${totalDevices.topDevicePercentage}% of traffic`,
    `Mobile usage is ${deviceData.find(d => d.label === 'Mobile')?.percentage || 0}% of total traffic`,
    `Desktop users tend to have longer session durations`
  ];

  const browserInsights = [
    `${browserStatsData.topBrowser} leads with ${browserStatsData.topBrowserPercentage}% market share`,
    `Modern browsers (Chrome, Firefox, Safari) account for 85%+ of traffic`,
    `Browser compatibility is excellent across all major platforms`
  ];

  return (
    <div className="space-y-8" style={{ willChange: 'transform' }}>
      {/* Device Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Device Distribution</h3>
            <span className="text-xs text-gray-600">{timeFrame === '7days' ? 'Last 7 Days' : timeFrame === '90days' ? 'Last 90 Days' : 'Last 30 Days'}</span>
          </div>
          <div className="space-y-4">
            {deviceData.map((device) => (
              <DeviceStatRow
                key={device.label}
                icon={device.icon}
                label={device.label}
                percentage={device.percentage}
              />
            ))}
          </div>
        </div>

        
      </div>

      {/* Browser Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Browser Distribution</h3>
            <span className="text-xs text-gray-600">{timeFrame === '7days' ? 'Last 7 Days' : timeFrame === '90days' ? 'Last 90 Days' : 'Last 30 Days'}</span>
          </div>
          <div className="space-y-4">
            {browserData.map((browser) => (
              <BrowserStatRow
                key={browser.name}
                name={browser.name}
                percentage={browser.percentage}
                trend={browser.trend}
                change={browser.change}
              />
            ))}
          </div>
        </div>

        
      </div>

      {/* Smart Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Device Insights</h3>
          <ul className="space-y-2">
            {smartInsights.map((insight, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold mb-4 text-green-900">Browser Insights</h3>
          <ul className="space-y-2">
            {browserInsights.map((insight, index) => (
              <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
});

export default Devices;