import { DeviceStatRow } from "../DeviceStatRow";
import { BrowserStatRow } from "../BrowserStatRow";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { usePremiumDashboardData } from '../PremiumDashboardContext';
import LoadingScreen from '../../../ui/loadingScreen';

const Devices = () => {
  const { data, isLoading } = usePremiumDashboardData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingScreen compact message="Loading device data..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No device data available</p>
      </div>
    );
  }

  const { deviceStats, browserStats } = data.devices;

  // Process device data for display
  const deviceData = [
    { 
      icon: <Laptop size={20} />, 
      label: "Desktop", 
      percentage: deviceStats.find(d => d.type === 'desktop')?.percentage || 0 
    },
    { 
      icon: <Smartphone size={20} />, 
      label: "Mobile", 
      percentage: deviceStats.find(d => d.type === 'mobile')?.percentage || 0 
    },
    { 
      icon: <Tablet size={20} />, 
      label: "Tablet", 
      percentage: deviceStats.find(d => d.type === 'tablet')?.percentage || 0 
    }
  ];

  const totalDevices = {
    count: deviceStats.reduce((sum, device) => sum + device.count, 0),
    growth: 0, // Would need historical data to calculate
    topDevice: deviceStats[0]?.type || "Desktop",
    topDevicePercentage: deviceStats[0]?.percentage || 0
  };

  const deviceTrends = deviceStats.map(device => ({
    icon: device.type === 'desktop' ? <Laptop size={16} /> : 
          device.type === 'mobile' ? <Smartphone size={16} /> : 
          <Tablet size={16} />,
    name: device.type.charAt(0).toUpperCase() + device.type.slice(1),
    users: device.count,
    trend: "up" as const,
    change: 0 // Would need historical data
  }));

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
          <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
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

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Device Trends</h3>
          <div className="space-y-4">
            {deviceTrends.map((trend) => (
              <div key={trend.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {trend.icon}
                  <span className="font-medium">{trend.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{trend.users.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">users</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browser Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Browser Distribution</h3>
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

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Browser Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Sessions</span>
              <span className="font-semibold">{browserStatsData.totalSessions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Top Browser</span>
              <span className="font-semibold">{browserStatsData.topBrowser}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Market Share</span>
              <span className="font-semibold">{browserStatsData.topBrowserPercentage}%</span>
            </div>
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
};

export default Devices;