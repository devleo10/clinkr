import { TabsContent } from "@radix-ui/react-tabs";
import { DeviceStatRow } from "../DeviceStatRow";
import { BrowserStatRow } from "../BrowserStatRow";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";

const Devices = () => {
  const [deviceData, setDeviceData] = useState([
    { icon: <Laptop size={20} />, label: "Desktop", percentage: 0 },
    { icon: <Smartphone size={20} />, label: "Mobile", percentage: 0 },
    { icon: <Tablet size={20} />, label: "Tablet", percentage: 0 }
  ]);

  const [totalDevices, setTotalDevices] = useState({
    count: 0,
    growth: 0,
    topDevice: "",
    topDevicePercentage: 0
  });

  const [deviceTrends, setDeviceTrends] = useState([
    { icon: <Laptop size={16} />, name: "Desktop", users: 0, trend: "up", change: 0 },
    { icon: <Smartphone size={16} />, name: "Mobile", users: 0, trend: "up", change: 0 },
    { icon: <Tablet size={16} />, name: "Tablet", users: 0, trend: "up", change: 0 }
  ]);

  // const [smartInsights, setSmartInsights] = useState([
  //   "Desktop users spend 2x more time on your links",
  //   "Mobile traffic peaks during commute hours"
  // ]);

  const [browserData, setBrowserData] = useState([
    { name: "Chrome", percentage: 0, trend: "up", change: 0 },
    { name: "Firefox", percentage: 0, trend: "up", change: 0 },
    { name: "Safari", percentage: 0, trend: "up", change: 0 },
    { name: "Edge", percentage: 0, trend: "up", change: 0 }
  ]);

  const [browserStats, setBrowserStats] = useState({
    totalSessions: 0,
    growth: 0,
    topBrowser: "",
    topBrowserPercentage: 0
  });



  useEffect(() => {
    fetchDeviceData();
    fetchBrowserData();
  }, []);

  const fetchDeviceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('link_analytics')
        .select('device_type')
        .eq('profile_id', user.id);

      if (error) throw error;

      // Calculate device percentages
      const total = data.length;
      if (total === 0) {
        return;
      }

      const desktopCount = data.filter(d => d.device_type === 'desktop').length;
      const mobileCount = data.filter(d => d.device_type === 'mobile').length;
      const tabletCount = data.filter(d => d.device_type === 'tablet').length;

      const desktopPercentage = Math.round((desktopCount / total) * 100);
      const mobilePercentage = Math.round((mobileCount / total) * 100);
      const tabletPercentage = Math.round((tabletCount / total) * 100);

      // Update device data
      setDeviceData([
        { icon: <Laptop size={20} />, label: "Desktop", percentage: desktopPercentage },
        { icon: <Smartphone size={20} />, label: "Mobile", percentage: mobilePercentage },
        { icon: <Tablet size={20} />, label: "Tablet", percentage: tabletPercentage }
      ]);

      // Find top device
      let topDevice = "Desktop";
      let topDevicePercentage = desktopPercentage;
      
      if (mobilePercentage > desktopPercentage && mobilePercentage > tabletPercentage) {
        topDevice = "Mobile";
        topDevicePercentage = mobilePercentage;
      } else if (tabletPercentage > desktopPercentage && tabletPercentage > mobilePercentage) {
        topDevice = "Tablet";
        topDevicePercentage = tabletPercentage;
      }

      // Update total devices
      setTotalDevices({
        count: total,
        growth: 8, // Placeholder - would need historical data to calculate
        topDevice,
        topDevicePercentage
      });

      // Update device trends
      setDeviceTrends([
        { icon: <Laptop size={16} />, name: "Desktop", users: desktopCount, trend: "up", change: 12 },
        { icon: <Smartphone size={16} />, name: "Mobile", users: mobileCount, trend: "up", change: 18 },
        { icon: <Tablet size={16} />, name: "Tablet", users: tabletCount, trend: "down", change: 3 }
      ]);

    } catch (error) {
      console.error('Error fetching device data:', error);
    }
  };

  const fetchBrowserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('link_analytics')
        .select('browser')
        .eq('profile_id', user.id);

      if (error) throw error;

      // Calculate browser percentages
      const total = data.length;
      if (total === 0) {
        return;
      }

      // Count occurrences of each browser
      const browserCounts: Record<string, number> = {};
      data.forEach(item => {
        const browser = item.browser || 'Unknown';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });

      // Calculate percentages and prepare data
      const browserStats = Object.entries(browserCounts).map(([name, count]) => {
        const percentage = Math.round((count / total) * 100);
        return {
          name,
          count,
          percentage,
          trend: "up" as "up" | "down", // Default to up, would need historical data
          change: Math.floor(Math.random() * 10) + 1 // Random placeholder
        };
      }).sort((a, b) => b.percentage - a.percentage);

      // Get top browsers (limit to 4)
      const topBrowsers = browserStats.slice(0, 4);
      
      // Update browser data
      setBrowserData(topBrowsers.map(b => ({
        name: b.name,
        percentage: b.percentage,
        trend: b.trend,
        change: b.change
      })));

      // Find top browser
      const topBrowser = browserStats[0] || { name: 'Unknown', percentage: 0 };

      // Update browser stats
      setBrowserStats({
        totalSessions: total,
        growth: 12, // Placeholder - would need historical data
        topBrowser: topBrowser.name,
        topBrowserPercentage: topBrowser.percentage
      });

    } catch (error) {
      console.error('Error fetching browser data:', error);
    }
  };

  return (
    <div>
      <TabsContent value="devices" className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-2xl shadow p-4">
            <h2 className="text-md font-semibold text-gray-800 mb-4">Device Distribution</h2>
            <div className="space-y-6">
              {deviceData.map((device, index) => (
                <DeviceStatRow
                  key={index}
                  icon={device.icon}
                  label={device.label}
                  percentage={device.percentage}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-600">Total Devices</p>
                  <h3 className="text-xl font-semibold">{totalDevices.count.toLocaleString()}</h3>
                  <p className="text-xs text-green-500">⬆ {totalDevices.growth}% vs last month</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Device</p>
                  <h3 className="text-xl font-semibold">{totalDevices.topDevice}</h3>
                  <p className="text-xs text-gray-400">{totalDevices.topDevicePercentage}% of total traffic</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Device Trends</h4>
              <div className="text-sm text-gray-700 space-y-2">
                {deviceTrends.map((trend, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2">
                      {trend.icon} {trend.name}
                    </span>
                    <span>
                      {trend.users.toLocaleString()} users{" "}
                      <span className={trend.trend === "up" ? "text-green-500" : "text-red-500"}>
                        {trend.trend === "up" ? "⬆" : "⬇"} {trend.change}%
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Smart Insights</h4>
              <ul className="text-sm text-gray-600 list-disc ml-4 space-y-1">
                {/* {smartInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))} */}
              </ul>
            </div>
          </div>
        </div>

        {/* Browser Distribution Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-2xl shadow p-4">
            <h2 className="text-md font-semibold text-gray-800 mb-4">Browser Distribution</h2>
            <div className="space-y-6">
              {browserData.map((browser, index) => (
                <BrowserStatRow
                  key={index}
                  name={browser.name}
                  percentage={browser.percentage}
                  trend={browser.trend as "up" | "down"}
                  change={browser.change}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-600">Total Browser Sessions</p>
                  <h3 className="text-xl font-semibold">{browserStats.totalSessions.toLocaleString()}</h3>
                  <p className="text-xs text-green-500">⬆ {browserStats.growth}% vs last month</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Browser</p>
                  <h3 className="text-xl font-semibold">{browserStats.topBrowser}</h3>
                  <p className="text-xs text-gray-400">{browserStats.topBrowserPercentage}% of total traffic</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Browser Insights</h4>
              
              <ul className="text-sm text-gray-600 list-disc ml-4 space-y-1">
                <li>Chrome users spend 2x more time on your links</li>
                <li>Mobile traffic peaks during commute hours</li>
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
    </div>
  );
};

export default Devices;