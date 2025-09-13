import { useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { detectDeviceType, detectBrowser } from '../../../lib/profile-utils';
import LoadingScreen from '../../ui/loadingScreen';
import BoltBackground from '../../homepage/BoltBackground';

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
  useEffect(() => {
    const trackClick = async () => {
      try {
        const deviceType = detectDeviceType();
        const browser = detectBrowser();
        
        console.log('Tracking click for short code:', shortLink.short_code);
        console.log('Detected device type:', deviceType);
        console.log('Detected browser:', browser);

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
                  console.log('Geolocation data from', apiUrl, ':', { lat, lng, countryCode });
                  break; // Success, exit loop
                }
              }
            } catch (apiError) {
              console.log('API failed:', apiUrl, apiError);
              continue; // Try next API
            }
          }
          
          // If all APIs failed, try browser geolocation as last resort
          if (!lat || !lng) {
            console.log('Trying browser geolocation...');
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
              console.log('Browser geolocation + reverse geocoding:', { lat, lng, countryCode });
            } catch (reverseError) {
              console.log('Reverse geocoding failed:', reverseError);
            }
          }
          
        } catch (error) {
          console.log('All geolocation methods failed:', error);
          // Set default coordinates for India (Kolkata area) as fallback
          lat = 22.5726;
          lng = 88.3639;
          countryCode = 'IN';
          console.log('Using fallback coordinates for India:', { lat, lng, countryCode });
        }

        // Update click count
        await supabase
          .from('shortened_links')
          .update({ clicks: shortLink.clicks + 1 })
          .eq('id', shortLink.id);

        // Track analytics
        const analyticsData = {
          user_id: shortLink.user_id,
          link_url: shortLink.original_url,
          short_code: shortLink.short_code,
          device_type: deviceType,
          browser,
          country_code: countryCode,
          event_type: 'click',
          link_type: 'shortened_link',
          lat,
          lng,
        };
        
        console.log('Inserting analytics data:', analyticsData);
        
        const { data: insertedData, error: analyticsError } = await supabase
          .from('link_analytics')
          .insert(analyticsData)
          .select();
          
        if (analyticsError) {
          console.error('Analytics insertion error:', analyticsError);
        } else {
          console.log('Analytics data inserted successfully:', insertedData);
        }

        // Redirect to original URL
        window.location.href = shortLink.original_url;
      } catch (error) {
        console.error('Error tracking shortened link click:', error);
        // Still redirect even if tracking fails
        window.location.href = shortLink.original_url;
      }
    };

    trackClick();
  }, [shortLink]);

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--c-bg)' }}>
      <BoltBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingScreen />
          <p className="text-sm text-gray-500 mt-4">If you're not redirected automatically, <a href={shortLink.original_url} className="text-orange-400 hover:underline">click here</a></p>
        </div>
      </div>
    </div>
  );
};

export default ShortenedLinkRedirect;
