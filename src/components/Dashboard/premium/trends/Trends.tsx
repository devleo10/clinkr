import { ArrowUpRight, ArrowDownRight, MousePointerClick, Eye, Clock, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import LoadingScreen from '../../../ui/loadingScreen';
import { usePremiumDashboardData } from '../PremiumDashboardContext';

interface TrendData {
  total: number;
  growth: number;
  dailyAverage: number;
  peakDay: string;
  peakTime?: string;
}

interface EngagementMetric {
  metric: string;
  value: string;
  trend: "up" | "down";
  change: number;
}

const Trends = () => {
  const { data, isLoading, timeFrame, setTimeFrame } = usePremiumDashboardData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingScreen compact message="Loading trends data..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Trends Data Yet</h3>
        <p className="text-gray-500 mb-4">Start sharing your links to see performance trends</p>
        <p className="text-sm text-gray-400">Trends and performance metrics will appear once you have click data</p>
      </div>
    );
  }

  const { trends } = data;

  // Calculate trend data
  const clicksTrend: TrendData = {
    total: trends.dailyData.reduce((sum, day) => sum + day.clicks, 0),
    growth: 0, // Would need historical data
    dailyAverage: Math.round(trends.dailyData.reduce((sum, day) => sum + day.clicks, 0) / trends.dailyData.length),
    peakDay: trends.dailyData.reduce((peak, day) => day.clicks > peak.clicks ? day : peak, trends.dailyData[0])?.date || 'N/A'
  };

  const viewsTrend: TrendData = {
    total: trends.dailyData.reduce((sum, day) => sum + day.views, 0),
    growth: 0, // Would need historical data
    dailyAverage: Math.round(trends.dailyData.reduce((sum, day) => sum + day.views, 0) / trends.dailyData.length),
    peakDay: trends.dailyData.reduce((peak, day) => day.views > peak.views ? day : peak, trends.dailyData[0])?.date || 'N/A'
  };

  // Engagement metrics
  const engagementMetrics: EngagementMetric[] = [
    {
      metric: "Click Rate",
      value: `${Math.round((clicksTrend.total / viewsTrend.total) * 100)}%`,
      trend: "up",
      change: 0
    },
    {
      metric: "Daily Average",
      value: clicksTrend.dailyAverage.toLocaleString(),
      trend: "up",
      change: 0
    },
    {
      metric: "Peak Performance",
      value: clicksTrend.peakDay,
      trend: "up",
      change: 0
    }
  ];

  return (
    <div className="space-y-8" style={{ willChange: 'transform' }}>
      {/* Time Frame Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Performance Trends</h2>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time Frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trend Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold">{clicksTrend.total.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 ml-1">+{clicksTrend.growth}%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold">{viewsTrend.total.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 ml-1">+{viewsTrend.growth}%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold">{clicksTrend.dailyAverage.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 ml-1">+0%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Peak Day</p>
              <p className="text-lg font-bold">{clicksTrend.peakDay}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Filter className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 ml-1">Best day</span>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {engagementMetrics.map((metric, index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-gray-600 mb-1">{metric.metric}</p>
              <p className="text-2xl font-bold mb-2">{metric.value}</p>
              <div className="flex items-center justify-center">
                {metric.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ml-1 ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {metric.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Charts Placeholder */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chart visualization would go here</p>
        </div>
      </div>

      {/* Weekly and Monthly Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
          <div className="space-y-3">
            {trends.weeklyData.slice(0, 4).map((week, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Week {week.week}</span>
                <div className="text-right">
                  <div className="font-semibold">{week.clicks} clicks</div>
                  <div className="text-sm text-gray-500">{week.views} views</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
          <div className="space-y-3">
            {trends.monthlyData.slice(0, 3).map((month, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{month.month}</span>
                <div className="text-right">
                  <div className="font-semibold">{month.clicks} clicks</div>
                  <div className="text-sm text-gray-500">{month.views} views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;