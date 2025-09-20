import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  Target,
  Eye,
  MousePointerClick,
  Flame,
  Star,
  Crown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

interface PerformanceOverTimeChartProps {
  dailyData: Array<{ date: string; clicks: number; views: number }>;
  timeFrame: string;
}

type ChartType = 'sleek-line' | 'clean-area' | 'modern-bar' | 'elegant-pie';
type MetricType = 'clicks' | 'views' | 'conversion' | 'all';

const PerformanceOverTimeChart: React.FC<PerformanceOverTimeChartProps> = ({ 
  dailyData, 
  timeFrame 
}) => {
  const [chartType, setChartType] = useState<ChartType>('sleek-line');
  const [metricType, setMetricType] = useState<MetricType>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) {
      return [];
    }
    
    return dailyData.map(item => ({
      ...item,
      conversion: item.views > 0 ? (item.clicks / item.views) * 100 : 0,
      uniqueVisitors: Math.floor(item.views * 0.7 + item.clicks * 0.3),
      formattedDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [dailyData]);


  // Enhanced custom tooltip with EvilCharts styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white/30 text-sm text-gray-800 min-w-[200px]"
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-orange-500" />
            <p className="font-bold text-orange-600">{label}</p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <motion.div 
                key={`item-${index}`} 
                className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium text-gray-700">{entry.name}:</span>
                </div>
                <span className="font-bold text-gray-900">
                  {entry.value.toFixed(2)}{entry.name === 'Conversion' ? '%' : ''}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Calculate trend for a given metric
  const calculateTrend = (data: any[], key: MetricType) => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    if (previous === 0) return latest > 0 ? 100 : 0;
    return ((latest - previous) / previous) * 100;
  };

  const trendClicks = useMemo(() => calculateTrend(chartData, 'clicks'), [chartData]);
  const trendViews = useMemo(() => calculateTrend(chartData, 'views'), [chartData]);
  const trendConversion = useMemo(() => calculateTrend(chartData, 'conversion'), [chartData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      console.log('Refreshing data...');
      setIsRefreshing(false);
    }, 1500);
  };

  const handleExport = () => {
    console.log('Exporting chart data...');
  };

  // Cool clean chart design with orange/amber palette
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 30, bottom: 80 }
    };

    switch (chartType) {
      case 'sleek-line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <defs>
                <linearGradient id="lineGradient1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ED7B00" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="lineGradient2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FCBB1F" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 3" stroke="#f1f5f9" strokeWidth={1} />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                height={60}
                interval={0}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {metricType === 'all' || metricType === 'clicks' ? (
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="url(#lineGradient1)" 
                  strokeWidth={3}
                  dot={{ fill: '#ED7B00', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ED7B00', strokeWidth: 2, fill: '#fff' }}
                  name="Clicks"
                />
              ) : null}
              {metricType === 'all' || metricType === 'views' ? (
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="url(#lineGradient2)" 
                  strokeWidth={3}
                  dot={{ fill: '#FCBB1F', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: '#FCBB1F', strokeWidth: 2, fill: '#fff' }}
                  name="Views"
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'clean-area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="areaGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ED7B00" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#ED7B00" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FCBB1F" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#FCBB1F" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 3" stroke="#f1f5f9" strokeWidth={1} />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                height={60}
                interval={0}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {metricType === 'all' || metricType === 'clicks' ? (
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#ED7B00" 
                  fill="url(#areaGradient1)" 
                  strokeWidth={2}
                  name="Clicks"
                />
              ) : null}
              {metricType === 'all' || metricType === 'views' ? (
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#FCBB1F" 
                  fill="url(#areaGradient2)" 
                  strokeWidth={2}
                  name="Views"
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'modern-bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <defs>
                <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ED7B00"/>
                  <stop offset="100%" stopColor="#F59E0B"/>
                </linearGradient>
                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FCBB1F"/>
                  <stop offset="100%" stopColor="#F59E0B"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 3" stroke="#f1f5f9" strokeWidth={1} />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                height={60}
                interval={0}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {metricType === 'all' || metricType === 'clicks' ? (
                <Bar 
                  dataKey="clicks" 
                  fill="url(#barGradient1)" 
                  radius={[4, 4, 0, 0]} 
                  name="Clicks"
                />
              ) : null}
              {metricType === 'all' || metricType === 'views' ? (
                <Bar 
                  dataKey="views" 
                  fill="url(#barGradient2)" 
                  radius={[4, 4, 0, 0]} 
                  name="Views"
                />
              ) : null}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'elegant-pie':
        const pieData = [
          { name: 'Clicks', value: chartData.reduce((sum, item) => sum + item.clicks, 0), color: '#ED7B00' },
          { name: 'Views', value: chartData.reduce((sum, item) => sum + item.views, 0), color: '#FCBB1F' },
        ].filter(item => item.value > 0);

        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '14px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  if (!chartData || chartData.length === 0) {
    return (
      <motion.div 
        className="glass-card bg-white/80 backdrop-blur-md border border-white/30 rounded-xl p-8 shadow-md relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white opacity-70" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400" />
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Flame className="w-12 h-12 mb-4 text-orange-400" />
          <p className="text-lg font-semibold">No data available for this period.</p>
          <p className="text-sm">Try adjusting the time frame or check your link activity.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="glass-card bg-white/80 backdrop-blur-md border border-white/30 rounded-xl shadow-md overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* EvilCharts-inspired gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 opacity-70" />
      
      {/* Animated accent line with gradient */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      {/* Corner decorations with EvilCharts style */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-orange-300 opacity-40 rounded-tl-xl" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-amber-300 opacity-40 rounded-br-xl" />

      <div className="p-6 relative z-10">
        {/* Header with EvilCharts-inspired styling */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Crown className="w-7 h-7 text-orange-600" />
            </motion.div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Performance Analytics
                </h3>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Star className="w-5 h-5 text-amber-500" />
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <SelectTrigger className="w-[140px] bg-white/70 border-orange-200 text-gray-700">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-orange-200 text-gray-700">
                <SelectItem value="sleek-line">✨ Sleek Line</SelectItem>
                <SelectItem value="clean-area">📊 Clean Area</SelectItem>
                <SelectItem value="modern-bar">📈 Modern Bar</SelectItem>
                <SelectItem value="elegant-pie">🥧 Elegant Pie</SelectItem>
              </SelectContent>
            </Select>

            <Select value={metricType} onValueChange={(value) => setMetricType(value as MetricType)}>
              <SelectTrigger className="w-[140px] bg-white/70 border-orange-200 text-gray-700">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent className="bg-white border-orange-200 text-gray-700">
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="conversion">Conversion Rate</SelectItem>
              </SelectContent>
            </Select>

            <motion.button 
              onClick={handleRefresh} 
              className="p-2 rounded-full bg-white/70 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            <motion.button 
              onClick={handleExport} 
              className="p-2 rounded-full bg-white/70 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="p-2 rounded-full bg-white/70 border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* EvilCharts-inspired info panel */}
        <motion.div 
          className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm flex items-start gap-3 mb-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Flame className="w-5 h-5 flex-shrink-0 text-orange-500" />
          </motion.div>
          <div>
            <p className="font-bold text-orange-700">Performance Analytics for {timeFrame}:</p>
            <p>Track your link performance with professional charts.</p>
          </div>
        </motion.div>

        {/* Enhanced summary statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div 
            className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl shadow-sm border border-orange-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <MousePointerClick className="w-6 h-6 text-orange-500" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Clicks</p>
              <p className="font-bold text-xl text-gray-800">{chartData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}</p>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl shadow-sm border border-amber-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <Eye className="w-6 h-6 text-amber-500" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Views</p>
              <p className="font-bold text-xl text-gray-800">{chartData.reduce((sum, item) => sum + item.views, 0).toLocaleString()}</p>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-xl shadow-sm border border-orange-300"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <Target className="w-6 h-6 text-orange-700" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Conversion Rate</p>
              <p className="font-bold text-xl text-gray-800">
                {(chartData.reduce((sum, item) => sum + item.conversion, 0) / chartData.length).toFixed(2)}%
              </p>
            </div>
          </motion.div>
        </div>

        <div className={`w-full ${isExpanded ? 'h-96' : 'h-80'}`}>
          {renderChart()}
        </div>
      </div>

      {/* Enhanced trend indicator with EvilCharts styling */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-orange-100/60 to-amber-100/60 border-t border-orange-200 p-4 text-sm text-gray-700 flex justify-around items-center backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div 
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50"
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        >
          <MousePointerClick className="w-4 h-4 text-orange-500" />
          Clicks: <span className={`font-bold ${trendClicks >= 0 ? 'text-green-600' : 'text-red-600'}`}>{trendClicks.toFixed(2)}%</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50"
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        >
          <Eye className="w-4 h-4 text-amber-500" />
          Views: <span className={`font-bold ${trendViews >= 0 ? 'text-green-600' : 'text-red-600'}`}>{trendViews.toFixed(2)}%</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50"
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        >
          <Target className="w-4 h-4 text-orange-700" />
          Conversion: <span className={`font-bold ${trendConversion >= 0 ? 'text-green-600' : 'text-red-600'}`}>{trendConversion.toFixed(2)}%</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PerformanceOverTimeChart;