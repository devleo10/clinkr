import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../../../lib/supabaseClient';
import * as L from 'leaflet';
import 'leaflet.heat';
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Filter, Smartphone, Laptop, Calendar } from "lucide-react";
import { motion } from 'framer-motion';

interface HeatmapLayerProps {
  points: Array<[number, number, number]>;
  radius: number;
  blur: number;
  max?: number;
  minOpacity?: number;
}

interface HeatmapDataPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface LinkAnalyticsItem {
  id: string;
  profile_id: string;
  user_id: string;
  event_type: string;
  device_type: string;
  browser: string;
  country_code: string;
  region: string;
  city: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

// Memoized HeatmapComponent to prevent unnecessary re-renders
const HeatmapComponent = React.memo(({ points, radius, blur, max, minOpacity }: HeatmapLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Create the heat layer
    const heatLayer = L.heatLayer(points, {
      radius,
      blur,
      max,
      minOpacity,
    });

    heatLayer.addTo(map);

    // Cleanup function
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, radius, blur, max, minOpacity, map]);

  return null;
});

HeatmapComponent.displayName = 'HeatmapComponent';

// Cluster interface for region grouping
interface RegionCluster {
  region: string;
  country: string;
  count: number;
  lat: number;
  lng: number;
}

const Geography = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [regionClusters, setRegionClusters] = useState<RegionCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [timeFrame, setTimeFrame] = useState<"7days" | "30days" | "90days">("30days");
  const [deviceFilter, setDeviceFilter] = useState<"all" | "mobile" | "desktop">("all");
  const [viewMode, setViewMode] = useState<"heatmap" | "clusters">("heatmap");
  
  // Raw data storage
  const [analyticsData, setAnalyticsData] = useState<LinkAnalyticsItem[]>([]);
  
  // Memoized map options
  const mapOptions = useMemo(() => ({
    center: [20, 0] as [number, number],
    zoom: 2,
    style: { height: '100%', width: '100%' }
  }), []);

  // Memoized heatmap options
  const heatmapOptions = useMemo(() => ({
    radius: 15,
    blur: 20,
    max: 1.0,
    minOpacity: 0.5
  }), []);

  // Optimized fetch function using useCallback
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // Calculate date range based on timeFrame
      const now = new Date();
      let startDate = new Date();
      
      if (timeFrame === "7days") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeFrame === "30days") {
        startDate.setDate(now.getDate() - 30);
      } else if (timeFrame === "90days") {
        startDate.setDate(now.getDate() - 90);
      }
      
      // Format dates for Supabase query
      const startDateStr = startDate.toISOString();
      
      // Get analytics data with additional fields for intensity calculation
      const { data, error } = await supabase
        .from('link_analytics')
        .select('*')
        .eq('profile_id', user.id)
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to fetch analytics data');
        return;
      }
      
      // Store raw data for filtering
      setAnalyticsData(data || []);
      
      // Process the data
      processData(data || []);
      
    } catch (err) {
      setError('Failed to process location data');
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame]);
  
  // Process data when filters change
  useEffect(() => {
    if (analyticsData.length > 0) {
      processData(analyticsData);
    }
  }, [deviceFilter, analyticsData, viewMode]);
  
  // Process and calculate metrics
  const processData = (data: LinkAnalyticsItem[]) => {
    // Filter data based on device type if needed
    const filteredData = deviceFilter === "all" 
      ? data 
      : data.filter(item => {
          if (deviceFilter === "mobile") {
            return item.device_type?.toLowerCase().includes("mobile") || 
                   item.device_type?.toLowerCase().includes("tablet");
          } else {
            return item.device_type?.toLowerCase().includes("desktop") || 
                   item.device_type?.toLowerCase().includes("laptop");
          }
        });
    
    // Process data with intensity calculation
    const locationMap = new Map<string, { count: number, recency: number, lat: number, lng: number }>();
    
    // Current time for recency calculation
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    
    // Process each data point
    filteredData.forEach((item: LinkAnalyticsItem) => {
      if (item.lat && item.lng) {
        // Create a unique key for each location
        const locationKey = `${item.lat.toFixed(3)},${item.lng.toFixed(3)}`;
        
        // Calculate recency factor (more recent = higher value)
        const itemDate = new Date(item.created_at).getTime();
        const daysDiff = Math.max(1, Math.floor((now - itemDate) / oneDay));
        const recencyFactor = 1 / Math.sqrt(daysDiff); // Square root to reduce the decay rate
        
        if (locationMap.has(locationKey)) {
          // Update existing location
          const location = locationMap.get(locationKey)!;
          location.count += 1;
          location.recency = Math.max(location.recency, recencyFactor);
        } else {
          // Add new location
          locationMap.set(locationKey, {
            count: 1,
            recency: recencyFactor,
            lat: item.lat,
            lng: item.lng
          });
        }
      }
    });
    
    // Convert map to array and calculate final intensity
    const validPoints: HeatmapDataPoint[] = Array.from(locationMap.values()).map(location => {
      // Calculate intensity based on count and recency
      // Formula: log(count + 1) * recency factor
      // This gives more weight to locations with many clicks
      // while still considering recency
      const intensity = Math.log(location.count + 1) * location.recency;
      
      return {
        lat: location.lat,
        lng: location.lng,
        intensity: intensity
      };
    });

    // Set data with valid points
    setHeatmapData(validPoints);
    
    // Process region clusters
    const regionMap = new Map<string, RegionCluster>();
    
    filteredData.forEach((item: LinkAnalyticsItem) => {
      if (item.region && item.lat && item.lng) {
        const regionKey = `${item.country_code}-${item.region}`;
        
        if (regionMap.has(regionKey)) {
          // Update existing region
          const region = regionMap.get(regionKey)!;
          region.count += 1;
        } else {
          // Add new region
          regionMap.set(regionKey, {
            region: item.region,
            country: item.country_code,
            count: 1,
            lat: item.lat,
            lng: item.lng
          });
        }
      }
    });
    
    // Convert region map to array and sort by count
    const clusters = Array.from(regionMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Limit to top 20 regions
    
    setRegionClusters(clusters);
    
  };

  // Effect hook to fetch data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized points array for the heatmap
  const heatmapPoints = useMemo(() => {
    return heatmapData.map(point => [point.lat, point.lng, point.intensity]);
  }, [heatmapData]);

  return (
    <motion.div 
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex flex-col md:flex-row md:gap-4 gap-2 w-full mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >        
        {/* Time Period Filter */}
        <div className="w-full md:w-auto">
          <Tabs defaultValue={timeFrame} onValueChange={(value) => setTimeFrame(value as "7days" | "30days" | "90days")}> 
            <TabsList className="w-full md:w-auto bg-white/90 backdrop-blur-sm border border-indigo-50 shadow-sm">
              <TabsTrigger 
                value="7days"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                7 Days
              </TabsTrigger>
              <TabsTrigger 
                value="30days"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                30 Days
              </TabsTrigger>
              <TabsTrigger 
                value="90days"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                90 Days
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Device Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-indigo-600" />
          <Select value={deviceFilter} onValueChange={(value) => setDeviceFilter(value as "all" | "mobile" | "desktop")}> 
            <SelectTrigger className="w-full md:w-[150px] bg-white/90 backdrop-blur-sm border border-indigo-50 shadow-sm">
              <SelectValue placeholder="Device Type" />
            </SelectTrigger>
            <SelectContent className='z-[9999]'>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="mobile">Mobile Only</SelectItem>
              <SelectItem value="desktop">Desktop Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* View Mode Toggle */}
        <div className="w-full md:w-auto">
          <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "heatmap" | "clusters")}> 
            <TabsList className="w-full md:w-auto bg-white/90 backdrop-blur-sm border border-indigo-50 shadow-sm">
              <TabsTrigger 
                value="heatmap"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                Heatmap
              </TabsTrigger>
              <TabsTrigger 
                value="clusters"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                Regions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>
      
      {error && (
        <motion.div 
          className="glass-card bg-white/80 backdrop-blur-lg border border-red-300 px-4 py-3 rounded-xl mb-4 text-red-700 shadow-sm relative overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 opacity-70" />
          <div className="relative z-10">{error}</div>
        </motion.div>
      )}
      
      {isLoading ? (
        <motion.div 
          className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl flex justify-center items-center h-96 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
          
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-indigo-600 font-medium">Loading geography data...</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 rounded-xl shadow-md overflow-hidden h-96 w-full relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ 
            boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70 z-0" />
          
          {/* Animated accent */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 z-10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <div className="relative z-10 h-full">
            <MapContainer center={mapOptions.center} zoom={mapOptions.zoom} style={mapOptions.style}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {viewMode === "heatmap" && heatmapData.length > 0 && (
                <HeatmapComponent
                  points={heatmapPoints as [number, number, number][]}
                  radius={heatmapOptions.radius}
                  blur={heatmapOptions.blur}
                  max={heatmapOptions.max}
                  minOpacity={heatmapOptions.minOpacity}
                />
              )}
              
              {viewMode === "clusters" && regionClusters.map((cluster, index) => (
                <CircleMarker 
                  key={`${cluster.country}-${cluster.region}-${index}`}
                  center={[cluster.lat, cluster.lng]}
                  radius={Math.min(20, Math.max(5, Math.log(cluster.count) * 5))}
                  pathOptions={{
                    fillColor: '#3b82f6',
                    fillOpacity: 0.6,
                    color: '#1d4ed8',
                    weight: 1
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{cluster.region}, {cluster.country}</h3>
                      <p className="text-sm">{cluster.count} {cluster.count === 1 ? 'interaction' : 'interactions'}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </motion.div>
      )}
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-4 rounded-xl shadow-md relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
          
          {/* Animated accent */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-indigo-600" />
              <h3 className="font-medium">Time Insights</h3>
            </div>
            <p className="text-sm text-gray-600">
              {timeFrame === "7days" ? "Last week" : timeFrame === "30days" ? "Last month" : "Last quarter"} shows 
              {heatmapData.length > 0 ? ` activity across ${regionClusters.length} regions` : " no significant activity"}
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-4 rounded-xl shadow-md relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
          
          {/* Animated accent */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone size={16} className="text-indigo-600" />
              <h3 className="font-medium">Mobile Engagement</h3>
            </div>
            <p className="text-sm text-gray-600">
              {deviceFilter === "mobile" ? "Showing only mobile traffic" : 
               deviceFilter === "desktop" ? "Mobile data filtered out" : 
               "Showing data for all devices"}
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-4 rounded-xl shadow-md relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
          
          {/* Animated accent */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Laptop size={16} className="text-indigo-600" />
              <h3 className="font-medium">Top Regions</h3>
            </div>
            <p className="text-sm text-gray-600">
              {regionClusters.length > 0 
                ? `Top region: ${regionClusters[0]?.region}, ${regionClusters[0]?.country} with ${regionClusters[0]?.count} interactions` 
                : "No regional data available"}
            </p>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="mt-2 text-sm text-gray-500 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        {viewMode === "heatmap" 
          ? `Showing heatmap data from ${heatmapData.length} location points` 
          : `Displaying ${regionClusters.length} region clusters`}
      </motion.div>
    </motion.div>
    
  );
};

export default Geography;