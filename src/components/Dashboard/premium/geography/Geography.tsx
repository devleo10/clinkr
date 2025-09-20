import React, { useMemo, lazy } from 'react';
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Filter, Smartphone, Laptop, Calendar } from "lucide-react";
import LoadingScreen from '../../../ui/loadingScreen';
import { usePremiumDashboardData } from '../PremiumDashboardContext';
import { formatCountryData } from '../../../../lib/countryUtils';

// Lazy load heavy mapping components
const MapContainer = lazy(() => import('react-leaflet').then(module => ({ default: module.MapContainer })));
const TileLayer = lazy(() => import('react-leaflet').then(module => ({ default: module.TileLayer })));
const Popup = lazy(() => import('react-leaflet').then(module => ({ default: module.Popup })));
const CircleMarker = lazy(() => import('react-leaflet').then(module => ({ default: module.CircleMarker })));

interface HeatmapLayerProps {
  points: Array<[number, number, number]>;
  radius: number;
  blur: number;
  max?: number;
  minOpacity?: number;
}

// Memoized HeatmapComponent to prevent unnecessary re-renders
const HeatmapComponent = React.memo(({ points, radius, blur, max, minOpacity }: HeatmapLayerProps) => {
  React.useEffect(() => {
    if (!points || points.length === 0) return;

    // Dynamically import leaflet and create heat layer
    const createHeatLayer = async () => {
      await import('leaflet');
      await import('leaflet.heat');
      
      // This would need to be implemented with proper map reference
      // For now, we'll skip the heat layer implementation
      console.log('Heat layer would be created here with points:', points.length);
    };

    createHeatLayer();
  }, [points, radius, blur, max, minOpacity]);

  return null;
});

const Geography = () => {
  const { data, isLoading, timeFrame, setTimeFrame } = usePremiumDashboardData();
  const [viewMode, setViewMode] = React.useState<'heatmap' | 'markers'>('heatmap');
  const [deviceFilter, setDeviceFilter] = React.useState<string>('all');

  const heatmapOptions = useMemo(() => ({
    radius: 15,
    blur: 20,
    max: 1.0,
    minOpacity: 0.5
  }), []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingScreen compact />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Geography Data Yet</h3>
        <p className="text-gray-500 mb-4">Share your links to see where your visitors are coming from</p>
        <p className="text-sm text-gray-400">Geographic analytics will appear once people start clicking your links</p>
      </div>
    );
  }

  const { heatmapData, countryStats, analyticsData } = data.geography;

  // Filter data based on device filter
  const filteredData = useMemo(() => {
    if (deviceFilter === 'all') return analyticsData;
    return analyticsData.filter(item => item.device_type === deviceFilter);
  }, [analyticsData, deviceFilter]);

  // Process filtered data for map display
  const mapData = useMemo(() => {
    if (viewMode === 'heatmap') {
      return heatmapData;
    } else {
      // Convert to marker format
      return filteredData
        .filter(item => item.lat && item.lng)
        .map(item => [item.lat!, item.lng!, 1] as [number, number, number]);
    }
  }, [viewMode, heatmapData, filteredData]);

  return (
    <div className="space-y-6" style={{ willChange: 'transform' }}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'heatmap' | 'markers')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="heatmap" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Heatmap
              </TabsTrigger>
              <TabsTrigger value="markers" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Markers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-2">
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map */}
      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {viewMode === 'heatmap' ? (
            <HeatmapComponent
              points={mapData}
              radius={heatmapOptions.radius}
              blur={heatmapOptions.blur}
              max={heatmapOptions.max}
              minOpacity={heatmapOptions.minOpacity}
            />
          ) : (
            filteredData
              .filter(item => item.lat && item.lng)
              .map((item, index) => (
                <CircleMarker
                  key={index}
                  center={[item.lat!, item.lng!]}
                  radius={5}
                  color="#ff7a1a"
                  fillColor="#ff7a1a"
                  fillOpacity={0.7}
                >
                  <Popup>
                    <div className="text-sm">
                      <p><strong>Country:</strong> {item.country_code || 'Unknown'}</p>
                      <p><strong>Device:</strong> {item.device_type || 'Unknown'}</p>
                      <p><strong>Browser:</strong> {item.browser || 'Unknown'}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))
          )}
        </MapContainer>
      </div>

      {/* Country Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Top Countries</h3>
          <div className="space-y-3">
            {countryStats.slice(0, 5).map((country, index) => {
              const formattedCountry = formatCountryData(country);
              return (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    {formattedCountry.flag && (
                      <span className="text-lg">{formattedCountry.flag}</span>
                    )}
                    <span className="font-medium">{formattedCountry.countryName}</span>
                    {!formattedCountry.isValid && (
                      <span className="text-xs text-orange-500">({country.country})</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{country.visits.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{country.percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
          <div className="space-y-3">
            {data.devices.deviceStats.slice(0, 3).map((device) => (
              <div key={device.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {device.type === 'mobile' && <Smartphone className="w-4 h-4 text-gray-600" />}
                  {device.type === 'desktop' && <Laptop className="w-4 h-4 text-gray-600" />}
                  {device.type === 'tablet' && <Smartphone className="w-4 h-4 text-gray-600" />}
                  <span className="font-medium capitalize">{device.type}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{device.count.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{device.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Geography;