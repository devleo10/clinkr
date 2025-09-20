import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity,
  Calendar,
  Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

interface ChartData {
  date: string;
  clicks: number;
  views: number;
  conversionRate: number;
  uniqueVisitors: number;
}

interface PerformanceOverTimeChartProps {
  dailyData: Array<{ date: string; clicks: number; views: number }>;
  timeFrame: string;
}

type ChartType = 'line' | 'area' | 'bar' | 'pie';
type MetricType = 'clicks' | 'views' | 'conversion' | 'all';

const PerformanceOverTimeChart: React.FC<PerformanceOverTimeChartProps> = ({ 
  dailyData, 
  timeFrame 
}) => {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [metricType, setMetricType] = useState<MetricType>('all');
  const [showComparison, setShowComparison] = useState(true);

  // Process data for charts
  const chartData = useMemo(() => {
    return dailyData.map(item => ({
      ...item,
      conversionRate: item.views > 0 ? Math.round((item.clicks / item.views) * 100) : 0,
      uniqueVisitors: Math.round(item.clicks * 0.8), // Mock data - would need actual unique visitor tracking
      formattedDate: formatDateForDisplay(item.date, timeFrame)
    }));
  }, [dailyData, timeFrame]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalClicks = chartData.reduce((sum, item) => sum + item.clicks, 0);
    const totalViews = chartData.reduce((sum, item) => sum + item.views, 0);
    const avgConversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    const peakDay = chartData.reduce((peak, item) => 
      item.clicks > peak.clicks ? item : peak, chartData[0] || { clicks: 0 }
    );

    return {
      totalClicks,
      totalViews,
      avgConversionRate: Math.round(avgConversionRate * 10) / 10,
      peakDay: peakDay.formattedDate || 'N/A',
      peakClicks: peakDay.clicks || 0,
      trend: calculateTrend(chartData)
    };
  }, [chartData]);

  // Color schemes
  const colors = {
    clicks: '#3B82F6',
    views: '#10B981',
    conversion: '#F59E0B',
    uniqueVisitors: '#8B5CF6'
  };

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.dataKey}:</span>
              <span className="text-sm font-semibold text-gray-900">
                {entry.dataKey === 'conversionRate' ? `${entry.value}%` : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format date based on time frame
  function formatDateForDisplay(dateStr: string, timeFrame: string): string {
    const date = new Date(dateStr);
    
    switch (timeFrame) {
      case '7days':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '30days':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '90days':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  // Calculate trend direction
  function calculateTrend(data: any[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.clicks, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.clicks, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {metricType === 'all' || metricType === 'clicks' ? (
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke={colors.clicks} 
                strokeWidth={3}
                dot={{ fill: colors.clicks, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors.clicks, strokeWidth: 2 }}
              />
            ) : null}
            {metricType === 'all' || metricType === 'views' ? (
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke={colors.views} 
                strokeWidth={3}
                dot={{ fill: colors.views, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors.views, strokeWidth: 2 }}
              />
            ) : null}
            {metricType === 'conversion' ? (
              <Line 
                type="monotone" 
                dataKey="conversionRate" 
                stroke={colors.conversion} 
                strokeWidth={3}
                dot={{ fill: colors.conversion, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors.conversion, strokeWidth: 2 }}
              />
            ) : null}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {metricType === 'all' || metricType === 'clicks' ? (
              <Area 
                type="monotone" 
                dataKey="clicks" 
                stackId="1"
                stroke={colors.clicks} 
                fill={colors.clicks}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            ) : null}
            {metricType === 'all' || metricType === 'views' ? (
              <Area 
                type="monotone" 
                dataKey="views" 
                stackId="2"
                stroke={colors.views} 
                fill={colors.views}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            ) : null}
            {metricType === 'conversion' ? (
              <Area 
                type="monotone" 
                dataKey="conversionRate" 
                stroke={colors.conversion} 
                fill={colors.conversion}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            ) : null}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {metricType === 'all' || metricType === 'clicks' ? (
              <Bar dataKey="clicks" fill={colors.clicks} radius={[4, 4, 0, 0]} />
            ) : null}
            {metricType === 'all' || metricType === 'views' ? (
              <Bar dataKey="views" fill={colors.views} radius={[4, 4, 0, 0]} />
            ) : null}
            {metricType === 'conversion' ? (
              <Bar dataKey="conversionRate" fill={colors.conversion} radius={[4, 4, 0, 0]} />
            ) : null}
          </BarChart>
        );

      case 'pie':
        const pieData = [
          { name: 'Clicks', value: summaryStats.totalClicks, color: colors.clicks },
          { name: 'Views', value: summaryStats.totalViews, color: colors.views },
          { name: 'Conversion Rate', value: summaryStats.avgConversionRate, color: colors.conversion }
        ];
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default:
        return null;
    }
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-xl p-8 shadow-md">
        <div className="text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
          <p className="text-gray-500">Start sharing your links to see performance trends over time</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-md border border-white/30 rounded-xl shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with controls */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Performance Over Time
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Track your link performance across different time periods
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Chart Type Selector */}
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Area
                  </div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Line
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Bar
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4" />
                    Pie
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Metric Type Selector */}
            <Select value={metricType} onValueChange={(value: MetricType) => setMetricType(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="clicks">Clicks Only</SelectItem>
                <SelectItem value="views">Views Only</SelectItem>
                <SelectItem value="conversion">Conversion Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summaryStats.totalClicks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summaryStats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{summaryStats.avgConversionRate}%</div>
            <div className="text-sm text-gray-600">Avg Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summaryStats.peakClicks}</div>
            <div className="text-sm text-gray-600">Peak Day</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-600">Overall Trend:</span>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            summaryStats.trend === 'up' ? 'bg-green-100 text-green-700' :
            summaryStats.trend === 'down' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {summaryStats.trend === 'up' ? (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Growing</span>
              </>
            ) : summaryStats.trend === 'down' ? (
              <>
                <TrendingUp className="w-4 h-4 rotate-180" />
                <span>Declining</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>Stable</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceOverTimeChart;
