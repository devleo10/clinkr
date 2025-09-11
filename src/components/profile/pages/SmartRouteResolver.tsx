import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import PublicProfile from './PublicProfile';
import ShortenedLinkRedirect from './ShortenedLinkRedirect';
import LoadingScreen from '../../ui/loadingScreen';

interface RouteResolution {
  type: 'username' | 'short_code' | 'not_found';
  data?: any;
}

const SmartRouteResolver = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const [resolution, setResolution] = useState<RouteResolution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveRoute = async () => {
      if (!identifier) {
        setResolution({ type: 'not_found' });
        setLoading(false);
        return;
      }

      try {
        // First, check if it's a username (existing profiles)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', identifier)
          .single();

        if (profile && !profileError) {
          setResolution({ type: 'username', data: profile });
          setLoading(false);
          return;
        }

        // If not a username, check if it's a short code
        const { data: shortLink, error: shortLinkError } = await supabase
          .from('shortened_links')
          .select('*')
          .eq('short_code', identifier)
          .eq('is_active', true)
          .single();

        if (shortLink && !shortLinkError) {
          // Check if link has expired
          if (shortLink.expires_at && new Date(shortLink.expires_at) < new Date()) {
            setResolution({ type: 'not_found' });
          } else {
            setResolution({ type: 'short_code', data: shortLink });
          }
          setLoading(false);
          return;
        }

        // Neither username nor short code found
        setResolution({ type: 'not_found' });
      } catch (error) {
        console.error('Error resolving route:', error);
        setResolution({ type: 'not_found' });
      } finally {
        setLoading(false);
      }
    };

    resolveRoute();
  }, [identifier]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (resolution?.type === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Not Found</h2>
          <p className="text-gray-600 mb-4">The requested page or link could not be found.</p>
          <button
            onClick={() => navigate('/homepage')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (resolution?.type === 'username') {
    return <PublicProfile />;
  }

  if (resolution?.type === 'short_code') {
    return <ShortenedLinkRedirect shortLink={resolution.data} />;
  }

  return null;
};

export default SmartRouteResolver;
