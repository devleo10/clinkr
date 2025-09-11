import { useEffect } from 'react';
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
  useEffect(() => {
    const trackClick = async () => {
      try {
        const deviceType = detectDeviceType();
        const browser = detectBrowser();
        let lat: number | null = null;
        let lng: number | null = null;
        
        console.log('Tracking click for short code:', shortLink.short_code);
        console.log('Detected device type:', deviceType);
        console.log('Detected browser:', browser);

        // Get geolocation
        try {
          const resp = await fetch('https://ipapi.co/json/');
          const data = await resp.json();
          lat = data.latitude;
          lng = data.longitude;
        } catch {
          // Ignore geolocation errors
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to your destination</p>
        <p className="text-sm text-gray-500 mt-2">If you're not redirected automatically, <a href={shortLink.original_url} className="text-orange-400 hover:underline">click here</a></p>
      </div>
    </div>
  );
};

export default ShortenedLinkRedirect;
