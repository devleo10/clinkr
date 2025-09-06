import { TabsContent } from "@radix-ui/react-tabs";
import { DeviceStatRow } from "../DeviceStatRow";
import { BrowserStatRow } from "../BrowserStatRow";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { motion } from "framer-motion";

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
      const countDevices = (dataArr: { device_type: string }[], type: string) => {
        const validTypes = ['desktop', 'mobile', 'tablet'];
        if (!validTypes.includes(type)) {
          console.warn(`Invalid device type detected: ${type}`);
          return 0;
        }
        return dataArr.filter((d) => d.device_type === type).length;
      };
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

      // Ensure percentages add up to 100% by adjusting the largest category
      let adjustedPercentages = { desktop: desktopPercentage, mobile: mobilePercentage, tablet: tabletPercentage };
      const totalPercentage = desktopPercentage + mobilePercentage + tabletPercentage;
      
      if (totalPercentage !== 100 && total > 0) {
        // Find the category with the highest count and adjust it
        const maxCategory = desktopCount >= mobileCount && desktopCount >= tabletCount ? 'desktop' :
                           mobileCount >= tabletCount ? 'mobile' : 'tablet';
        adjustedPercentages[maxCategory] += (100 - totalPercentage);
      }

      setDeviceData([
        { icon: <Laptop size={20} />, label: "Desktop", percentage: adjustedPercentages.desktop },
        { icon: <Smartphone size={20} />, label: "Mobile", percentage: adjustedPercentages.mobile },
        { icon: <Tablet size={20} />, label: "Tablet", percentage: adjustedPercentages.tablet }
      ]);

      // Find top device
      let topDevice = "Desktop";
      let topDevicePercentage = adjustedPercentages.desktop;
      if (adjustedPercentages.mobile > adjustedPercentages.desktop && adjustedPercentages.mobile > adjustedPercentages.tablet) {
        topDevice = "Mobile";
        topDevicePercentage = adjustedPercentages.mobile;
      } else if (adjustedPercentages.tablet > adjustedPercentages.desktop && adjustedPercentages.tablet > adjustedPercentages.mobile) {
        topDevice = "Tablet";
        topDevicePercentage = adjustedPercentages.tablet;
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

      // Dynamic Smart Insights (updated to use adjusted percentages)
      const insights: string[] = [];
      if (mobileCount > desktopCount && mobileCount > tabletCount) {
        insights.push(`Mobile engagement dominates with ${adjustedPercentages.mobile}% of clicks.`);
      } else if (desktopCount > mobileCount && desktopCount > tabletCount) {
        insights.push(`Desktop users are more engaged with ${adjustedPercentages.desktop}% of clicks.`);
      } else if (tabletCount > 0) {
        insights.push(`Tablet usage is notable at ${adjustedPercentages.tablet}% of clicks.`);
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
      const countBrowsers = (dataArr: { browser: string }[], name: string) => {
        const validBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Brave', 'Unknown'];
        if (!validBrowsers.includes(name)) {
          console.warn(`Invalid browser name detected: ${name}`);
          return 0;
        }
        return dataArr.filter((d) => d.browser === name).length;
      };
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

      // Ensure browser percentages add up to 100% by adjusting the top browser
      const totalBrowserPercentage = browserStatsArr.reduce((sum, browser) => sum + browser.percentage, 0);
      if (totalBrowserPercentage !== 100 && total > 0 && browserStatsArr.length > 0) {
        browserStatsArr[0].percentage += (100 - totalBrowserPercentage);
      }

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
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-md font-semibold text-black mb-4">Device Distribution</h2>
            <div className="space-y-3">
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-black font-medium">Total Devices</p>
                  <h3 className="text-xl font-bold text-black">{totalDevices.count.toLocaleString()}</h3>
                  <p className="text-xs font-semibold text-green-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {totalDevices.growth}% vs last month
                  </p>
                </div>
                <div>
                  <p className="text-sm text-black font-medium">Top Device</p>
                  <h3 className="text-xl font-bold text-black">{totalDevices.topDevice}</h3>
                  <p className="text-xs font-medium text-orange-700">{totalDevices.topDevicePercentage}% of total traffic</p>
                </div>
              </div>
            </div>

            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h4 className="text-sm font-semibold text-black mb-3">Device Trends</h4>
              <div className="space-y-3">
                {deviceTrends.map((trend, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="font-medium flex items-center gap-2 text-orange-700">
                      <span className="text-orange-600">{trend.icon}</span> {trend.name}
                    </span>
                    <span>
                      <span className="font-medium text-black">{trend.users.toLocaleString()} users </span>
                      <span className={trend.trend === "up" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {trend.trend === "up" ? "⬆" : "⬇"} {trend.change}%
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h4 className="text-sm font-semibold text-black mb-3">Smart Insights</h4>
              <ul className="text-sm text-black list-disc ml-4 space-y-2">
                {smartInsights.length > 0 ? smartInsights.map((insight, index) => (
                  <li key={index} className="font-medium">{insight}</li>
                )) : <li className="font-medium">No insights available yet.</li>}
              </ul>
            </motion.div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-md font-semibold text-black mb-4">Browser Distribution</h2>
            <div className="space-y-3">
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-black font-medium">Total Browser Sessions</p>
                  <h3 className="text-xl font-bold text-orange-700">{browserStats.totalSessions.toLocaleString()}</h3>
                  <p className="text-xs font-semibold text-green-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {browserStats.growth}% vs last month
                  </p>
                </div>
                <div>
                  <p className="text-sm text-black font-medium">Top Browser</p>
                  <h3 className="text-xl font-bold text-orange-700">{browserStats.topBrowser}</h3>
                  <p className="text-xs font-medium text-orange-600">{browserStats.topBrowserPercentage}% of total traffic</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="text-sm font-semibold text-black mb-3">Browser Insights</h4>
              <ul className="text-sm text-black list-disc ml-4 space-y-2">
                {browserInsights.length > 0 ? browserInsights.map((insight, index) => (
                  <li key={index} className="font-medium">{insight}</li>
                )) : <li className="font-medium">No insights available yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
    </div>
  );
};

export default Devices;