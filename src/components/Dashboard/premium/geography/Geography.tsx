import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { MapPin, Smartphone, Laptop } from "lucide-react";
import LoadingScreen from '../../../ui/loadingScreen';
import { usePremiumDashboardData } from '../PremiumDashboardContext';
import { formatCountryData } from '../../../../lib/countryUtils';
import ErrorBoundary from '../../../ErrorBoundary';

// Custom CSS for enhanced popup styling
const popupStyles = `
  .custom-popup .leaflet-popup-content-wrapper {
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }
  
  .custom-popup .leaflet-popup-content {
    margin: 0 !important;
    line-height: 1 !important;
  }
  
  .custom-popup .leaflet-popup-tip {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(251, 146, 60, 0.2) !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  }
  
  .marker-pulse {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(249, 115, 22, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = popupStyles;
  document.head.appendChild(styleSheet);
}

// Enhanced marker component with region data
const EnhancedMarker = React.memo(({ 
  lat, 
  lng, 
  country, 
  region, 
  clickCount
}: {
  lat: number;
  lng: number;
  country: string;
  region?: string;
  clickCount: number;
}) => {
  const formattedCountry = formatCountryData({ country, visits: clickCount });
  const displayName = region || formattedCountry.countryName || country;
  
  // Dynamic marker size based on click count
  const getMarkerSize = (count: number) => {
    if (count >= 100) return 12;
    if (count >= 50) return 10;
    if (count >= 20) return 8;
    if (count >= 10) return 6;
    return 5;
  };

  // Dynamic marker color based on click count
  const getMarkerColor = (count: number) => {
    if (count >= 100) return '#dc2626'; // red-600
    if (count >= 50) return '#ea580c';  // orange-600
    if (count >= 20) return '#f97316';  // orange-500
    if (count >= 10) return '#f59e0b';  // amber-500
    return '#d97706'; // amber-600
  };

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={getMarkerSize(clickCount)}
      color={getMarkerColor(clickCount)}
      fillColor={getMarkerColor(clickCount)}
      fillOpacity={0.8}
      weight={2}
      className="marker-pulse"
    >
      <Popup className="custom-popup" closeButton={false}>
        <div className="glass-card bg-white/95 backdrop-blur-md border border-orange-200/50 rounded-xl shadow-xl p-4 min-w-[180px]">
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 rounded-t-xl"></div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-base leading-tight">{displayName}</h3>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Clicks</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <span className="font-bold text-orange-600 text-lg">{clickCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
});

const Geography = React.memo(() => {
  const { data, isLoading, timeFrame, setTimeFrame } = usePremiumDashboardData();
  const [deviceFilter, setDeviceFilter] = React.useState<string>('all');

  // Extract data safely
  const { countryStats, analyticsData } = data?.geography || { countryStats: [], analyticsData: [] };

  // Filter data based on device filter
  const filteredData = useMemo(() => {
    if (!analyticsData) return [];
    if (deviceFilter === 'all') return analyticsData;
    return analyticsData.filter(item => item.device_type === deviceFilter);
  }, [analyticsData, deviceFilter]);

  // Group data by location and count clicks
  const locationData = useMemo(() => {
    const locationMap = new Map<string, {
      lat: number;
      lng: number;
      country: string;
      region?: string;
      clickCount: number;
      deviceType: string;
      browser: string;
    }>();

    filteredData.forEach(item => {
      if (item.lat && item.lng) {
        const key = `${item.lat.toFixed(2)}-${item.lng.toFixed(2)}`;
        const existing = locationMap.get(key);
        
        if (existing) {
          existing.clickCount += 1;
        } else {
          locationMap.set(key, {
            lat: item.lat,
            lng: item.lng,
            country: item.country_code || 'Unknown',
            region: item.region || undefined,
            clickCount: 1,
            deviceType: item.device_type || 'unknown',
            browser: item.browser || 'Unknown'
          });
        }
      }
    });

    return Array.from(locationMap.values()).sort((a, b) => b.clickCount - a.clickCount);
  }, [filteredData]);

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

  return (
    <div className="space-y-8" style={{ willChange: 'transform' }}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-sm">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Geographic Analytics</h2>
            <p className="text-sm text-gray-600">Track visitor locations and engagement</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="w-[160px] bg-white border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-orange-400 focus:ring-2 transition-colors">
              <SelectValue placeholder="Device Type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-xl">
              <SelectItem value="all" className="hover:bg-gray-50 focus:bg-gray-50 data-[highlighted]:bg-gray-50 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600">All Devices</SelectItem>
              <SelectItem value="mobile" className="hover:bg-gray-50 focus:bg-gray-50 data-[highlighted]:bg-gray-50 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600">Mobile</SelectItem>
              <SelectItem value="desktop" className="hover:bg-gray-50 focus:bg-gray-50 data-[highlighted]:bg-gray-50 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600">Desktop</SelectItem>
              <SelectItem value="tablet" className="hover:bg-gray-50 focus:bg-gray-50 data-[highlighted]:bg-gray-50 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600">Tablet</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-orange-400 focus:ring-2 transition-colors">
              <SelectValue placeholder="Time Frame" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-xl">
              <SelectItem value="7days" className="hover:bg-gray-50 focus:bg-gray-50 data-[highlighted]:bg-gray-50 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600">7 Days</SelectItem>
              <SelectItem value="30days" className="hover:bg-gray-50 focus:bg-gray-50 data-[highlighted]:bg-gray-50 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600">30 Days</SelectItem>
              <SelectItem value="90days" className="hover:bg-gray-50 focus:bg-gray-50 data-[highlighted]:bg-gray-50 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400"></div>
        
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30"></div>
        
        <div className="h-[600px] relative z-10">
          <ErrorBoundary
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-4 shadow-sm">
                    <MapPin className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Unavailable</h3>
                  <p className="text-sm text-gray-600">Unable to load geographic data at this time</p>
                </div>
              </div>
            }
          >
        <MapContainer
              key={`map-${deviceFilter}`} // Force re-render when device filter changes
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
              {locationData.map((location, index) => (
                <EnhancedMarker
                  key={`${location.lat}-${location.lng}-${index}`}
                  lat={location.lat}
                  lng={location.lng}
                  country={location.country}
                  region={location.region}
                  clickCount={location.clickCount}
                />
              ))}
            </MapContainer>
          </ErrorBoundary>
                    </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400"></div>
          
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-white to-amber-50/20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Top Countries</h3>
            </div>
            
            <div className="space-y-3">
              {countryStats.slice(0, 5).map((country, index) => {
                const formattedCountry = formatCountryData(country);
                return (
                  <div key={country.country} className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-sm font-bold text-orange-600">
                        {index + 1}
                      </div>
                      {formattedCountry.flag && (
                        <span className="text-xl">{formattedCountry.flag}</span>
                      )}
                      <span className="font-semibold text-gray-800">{formattedCountry.countryName}</span>
                      {!formattedCountry.isValid && (
                        <span className="text-xs text-orange-500">({country.country})</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{country.visits.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{country.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400"></div>
          
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-white to-amber-50/20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-sm">
                <Smartphone className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Device Distribution</h3>
            </div>
            
            <div className="space-y-3">
              {data.devices.deviceStats.slice(0, 3).map((device) => {
                // Calculate percentage based on filtered data for this specific device type
                const filteredDeviceCount = filteredData.filter(item => {
                  const normalizedDevice = item.device_type?.toLowerCase() || 'unknown';
                  return normalizedDevice === device.type;
                }).length;
                
                const totalFilteredCount = filteredData.length;
                const calculatedPercentage = totalFilteredCount > 0 ? Math.round((filteredDeviceCount / totalFilteredCount) * 100) : 0;
                
                return (
                  <div key={device.type} className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-sm">
                        {device.type === 'mobile' && <Smartphone className="w-5 h-5 text-orange-600" />}
                        {device.type === 'desktop' && <Laptop className="w-5 h-5 text-orange-600" />}
                        {device.type === 'tablet' && <Smartphone className="w-5 h-5 text-orange-600" />}
                      </div>
                      <span className="font-semibold capitalize text-gray-800">{device.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{filteredDeviceCount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{calculatedPercentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Geography;