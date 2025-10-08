import { useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { detectDeviceType, detectBrowser } from '../../../lib/profile-utils';

interface ShortenedLink {
  id: string;
  short_code: string;
  original_url: string;
  title?: string;
  user_id: string;
  clicks: number;
  expires_at?: string;
}

interface ShortenedLinkRedirectProps {
  shortLink: ShortenedLink;
}

const ShortenedLinkRedirect = ({ shortLink }: ShortenedLinkRedirectProps) => {
  const hasTrackedRef = useRef(false);
  const trackingIdRef = useRef<string | null>(null);

  useEffect(() => {
    const trackClick = async () => {
      // Prevent double tracking (React StrictMode safe)
      if (hasTrackedRef.current) {
        return;
      }
      
      // Generate unique tracking ID for this click
      const trackingId = `${shortLink.id}-${Date.now()}-${Math.random()}`;
      trackingIdRef.current = trackingId;
      hasTrackedRef.current = true;
      
      try {
        const deviceType = detectDeviceType();
        const browser = detectBrowser();

        // Get user's IP address and hash it for unique visitor tracking
        let hashedIp: string | null = null;
        try {
          // Try to get IP from geolocation API response
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          const userIp = ipData.ip;
          
          // Hash the IP address for privacy (simple hash for demo)
          if (userIp) {
            hashedIp = btoa(userIp).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
          }
        } catch (ipError) {
          // IP address retrieval failed - use fallback identifier
          // Use a fallback identifier based on user agent + timestamp
          hashedIp = btoa(navigator.userAgent + Date.now().toString()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
        }

        // Get geolocation and country with multiple fallbacks
        let countryCode: string | null = null;
        let lat: number | null = null;
        let lng: number | null = null;
        
        try {
          // Try multiple geolocation APIs for better accuracy
          const apis = [
            'https://ipapi.co/json/',
            'https://ip-api.com/json/',
            'https://api.ipgeolocation.io/ipgeo?apiKey=free'
          ];
          
          for (const apiUrl of apis) {
            try {
              const resp = await fetch(apiUrl, { 
                headers: {
                  'Accept': 'application/json'
                }
              });
              
              if (resp.ok) {
                const data = await resp.json();
                
                // Handle different API response formats
                if (apiUrl.includes('ipapi.co')) {
                  lat = data.latitude;
                  lng = data.longitude;
                  countryCode = data.country_code;
                } else if (apiUrl.includes('ip-api.com')) {
                  lat = data.lat;
                  lng = data.lon;
                  countryCode = data.countryCode;
                } else if (apiUrl.includes('ipgeolocation.io')) {
                  lat = data.latitude;
                  lng = data.longitude;
                  countryCode = data.country_code2;
                }
                
                if (lat && lng && countryCode) {
                  break; // Success, exit loop
                }
              }
            } catch (apiError) {
              // API failed, try next one
              continue; // Try next API
            }
          }
          
          // If all APIs failed, try browser geolocation as last resort
          if (!lat || !lng) {
            // Try browser geolocation as fallback
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                enableHighAccuracy: true
              });
            });
            
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            
            // Try to get country from coordinates using reverse geocoding
            try {
              const reverseResp = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
              );
              const reverseData = await reverseResp.json();
              countryCode = reverseData.countryCode;
              // Reverse geocoding successful
            } catch (reverseError) {
              // Reverse geocoding failed
            }
          }
          
        } catch (error) {
          // Set default coordinates for India (Kolkata area) as fallback
          lat = 22.5726;
          lng = 88.3639;
          countryCode = 'IN';
        }

        // Server-side: atomically record click + analytics via RPC (works for anon)
        const meta = {
          device_type: deviceType,
          browser,
          country_code: countryCode,
          lat,
          lng,
          hashed_ip: hashedIp,
          tracking_id: trackingIdRef.current,
        };
        await supabase.rpc('record_short_link_click', {
          p_short_code: shortLink.short_code,
          p_meta: meta,
        });

        // Redirect to original URL
        window.location.href = shortLink.original_url;
      } catch (error) {
        // Still redirect even if tracking fails
        window.location.href = shortLink.original_url;
      }
    };

    trackClick();
  }, [shortLink]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        {/* Custom Loader */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-orange-400 border-t-transparent animate-spin"></div>
        </div>
        
        {/* Redirecting Message */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Redirecting to the link</h2>
        <p className="text-sm text-gray-600 mb-4">Please wait while we redirect you...</p>
        
        {/* Fallback Link */}
        <p className="text-xs text-gray-500">
          If you're not redirected automatically, 
          <a href={shortLink.original_url} className="text-orange-400 hover:underline ml-1">click here</a>
        </p>
      </div>
    </div>
  );
};

export default ShortenedLinkRedirect;
