import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../../../lib/supabaseClient';
import * as L from 'leaflet';
import 'leaflet.heat';
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Filter, Smartphone, Laptop, Calendar } from "lucide-react";

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
    <div className="w-full h-full">
      <div className="flex flex-col md:flex-row md:gap-4 gap-2 w-full mb-4">        
        {/* Time Period Filter */}
        <div className="w-full md:w-auto">
          <Tabs defaultValue={timeFrame} onValueChange={(value) => setTimeFrame(value as "7days" | "30days" | "90days")}> 
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Device Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} />
          <Select value={deviceFilter} onValueChange={(value) => setDeviceFilter(value as "all" | "mobile" | "desktop")}> 
            <SelectTrigger className="w-full md:w-[150px]">
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
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              <TabsTrigger value="clusters">Regions</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="h-96 w-full border rounded">
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
      )}
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-blue-600" />
            <h3 className="font-medium">Time Insights</h3>
          </div>
          <p className="text-sm text-gray-600">
            {timeFrame === "7days" ? "Last week" : timeFrame === "30days" ? "Last month" : "Last quarter"} shows 
            {heatmapData.length > 0 ? ` activity across ${regionClusters.length} regions` : " no significant activity"}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={16} className="text-blue-600" />
            <h3 className="font-medium">Mobile Engagement</h3>
          </div>
          <p className="text-sm text-gray-600">
            {deviceFilter === "mobile" ? "Showing only mobile traffic" : 
             deviceFilter === "desktop" ? "Mobile data filtered out" : 
             "Showing data for all devices"}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Laptop size={16} className="text-blue-600" />
            <h3 className="font-medium">Top Regions</h3>
          </div>
          <p className="text-sm text-gray-600">
            {regionClusters.length > 0 
              ? `Top region: ${regionClusters[0]?.region}, ${regionClusters[0]?.country} with ${regionClusters[0]?.count} interactions` 
              : "No regional data available"}
          </p>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        {viewMode === "heatmap" 
          ? `Showing heatmap data from ${heatmapData.length} location points` 
          : `Displaying ${regionClusters.length} region clusters`}
      </div>
    </div>
  );
};

export default Geography;