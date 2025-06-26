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

  const [smartInsights, setSmartInsights] = useState<string[]>([]);
  const [browserInsights, setBrowserInsights] = useState<string[]>([]);

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

      // Fetch current period (last 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const { data: currentData, error: currentError } = await supabase
        .from('link_analytics')
        .select('device_type')
        .eq('profile_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());
      if (currentError) throw currentError;

      // Fetch previous period (30-60 days ago)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const { data: previousData, error: previousError } = await supabase
        .from('link_analytics')
        .select('device_type')
        .eq('profile_id', user.id)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());
      if (previousError) throw previousError;

      // Calculate device counts for current and previous periods
      // Helper functions with types
      const countDevices = (dataArr: { device_type: string }[], type: string) => dataArr.filter((d) => d.device_type === type).length;
      const total = currentData.length;
      const prevTotal = previousData.length;
      const desktopCount = countDevices(currentData, 'desktop');
      const mobileCount = countDevices(currentData, 'mobile');
      const tabletCount = countDevices(currentData, 'tablet');
      const prevDesktop = countDevices(previousData, 'desktop');
      const prevMobile = countDevices(previousData, 'mobile');
      const prevTablet = countDevices(previousData, 'tablet');

      const desktopPercentage = total ? Math.round((desktopCount / total) * 100) : 0;
      const mobilePercentage = total ? Math.round((mobileCount / total) * 100) : 0;
      const tabletPercentage = total ? Math.round((tabletCount / total) * 100) : 0;

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

      // Calculate growth
      const growth = prevTotal === 0 ? 100 : Math.round(((total - prevTotal) / prevTotal) * 100);
      setTotalDevices({
        count: total,
        growth,
        topDevice,
        topDevicePercentage
      });

      // Device trends (per device type growth, with correct zero handling)
      const deviceTrendsArr = [
        {
          icon: <Laptop size={16} />, name: "Desktop", users: desktopCount,
          trend: desktopCount >= prevDesktop ? "up" : "down",
          change:
            prevDesktop === 0
              ? (desktopCount === 0 ? 0 : 100)
              : Math.round(((desktopCount - prevDesktop) / prevDesktop) * 100)
        },
        {
          icon: <Smartphone size={16} />, name: "Mobile", users: mobileCount,
          trend: mobileCount >= prevMobile ? "up" : "down",
          change:
            prevMobile === 0
              ? (mobileCount === 0 ? 0 : 100)
              : Math.round(((mobileCount - prevMobile) / prevMobile) * 100)
        },
        {
          icon: <Tablet size={16} />, name: "Tablet", users: tabletCount,
          trend: tabletCount >= prevTablet ? "up" : "down",
          change:
            prevTablet === 0
              ? (tabletCount === 0 ? 0 : 100)
              : Math.round(((tabletCount - prevTablet) / prevTablet) * 100)
        }
      ];
      setDeviceTrends(deviceTrendsArr);

      // Dynamic Smart Insights (unchanged)
      const insights: string[] = [];
      if (mobileCount > desktopCount && mobileCount > tabletCount) {
        insights.push(`Mobile engagement dominates with ${mobilePercentage}% of clicks.`);
      } else if (desktopCount > mobileCount && desktopCount > tabletCount) {
        insights.push(`Desktop users are more engaged with ${desktopPercentage}% of clicks.`);
      } else if (tabletCount > 0) {
        insights.push(`Tablet usage is notable at ${tabletPercentage}% of clicks.`);
      }
      if (total > 0) {
        const peakDevice = [
          { label: 'Desktop', count: desktopCount },
          { label: 'Mobile', count: mobileCount },
          { label: 'Tablet', count: tabletCount }
        ].sort((a, b) => b.count - a.count)[0];
        insights.push(`Most users access via ${peakDevice.label}.`);
      }
      setSmartInsights(insights);
    } catch (error) {
      console.error('Error fetching device data:', error);
    }
  };

  const fetchBrowserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current period (last 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const { data: currentData, error: currentError } = await supabase
        .from('link_analytics')
        .select('browser')
        .eq('profile_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());
      if (currentError) throw currentError;

      // Fetch previous period (30-60 days ago)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const { data: previousData, error: previousError } = await supabase
        .from('link_analytics')
        .select('browser')
        .eq('profile_id', user.id)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());
      if (previousError) throw previousError;

      // Calculate browser stats for current and previous periods
      // Helper functions with types
      const countBrowsers = (dataArr: { browser: string }[], name: string) => dataArr.filter((d) => d.browser === name).length;
      const getBrowserNames = (arr: { browser: string }[]) => Array.from(new Set(arr.map((d) => d.browser || 'Unknown')));
      const total = currentData.length;
      const prevTotal = previousData.length;
      const browserNames = getBrowserNames(currentData.concat(previousData));
      const browserStatsArr = browserNames.map(name => {
        const count = countBrowsers(currentData, name);
        const prevCount = countBrowsers(previousData, name);
        return {
          name,
          count,
          percentage: total ? Math.round((count / total) * 100) : 0,
          trend: count >= prevCount ? "up" : "down",
          change: prevCount === 0 ? 100 : Math.round(((count - prevCount) / prevCount) * 100)
        };
      }).sort((a, b) => b.percentage - a.percentage);

      // Get top browsers (limit to 4)
      const topBrowsers = browserStatsArr.slice(0, 4);
      setBrowserData(topBrowsers.map((b) => ({
        name: String(b.name),
        percentage: b.percentage,
        trend: b.trend,
        change: b.change,
      })));

      // Find top browser
      const topBrowser = browserStatsArr[0] || { name: 'Unknown', percentage: 0 };
      setBrowserStats({
        totalSessions: total,
        growth: prevTotal === 0 ? 100 : Math.round(((total - prevTotal) / prevTotal) * 100),
        topBrowser: String(topBrowser.name),
        topBrowserPercentage: topBrowser.percentage,
      });

      // Dynamic Browser Insights (unchanged)
      const insights: string[] = [];
      if (topBrowser.name && topBrowser.percentage > 0) {
        insights.push(`${topBrowser.name} users account for ${topBrowser.percentage}% of sessions.`);
      }
      if (browserStatsArr.length > 1) {
        const second = browserStatsArr[1];
        insights.push(`${second.name} is the next most popular browser at ${second.percentage}%.`);
      }
      setBrowserInsights(insights);
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
                {smartInsights.length > 0 ? smartInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                )) : <li>No insights available yet.</li>}
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
                {browserInsights.length > 0 ? browserInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                )) : <li>No insights available yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
    </div>
  );
};

export default Devices;