import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import PublicProfile from './PublicProfile';
import ShortenedLinkRedirect from './ShortenedLinkRedirect';
import { useLoading } from '../../../contexts/LoadingContext';
import BoltBackground from '../../homepage/BoltBackground';

interface RouteResolution {
  type: 'username' | 'short_code' | 'not_found';
  data?: any;
}

const SmartRouteResolver = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [resolution, setResolution] = useState<RouteResolution | null>(null);

  useEffect(() => {
    const resolveRoute = async () => {
      console.log('Resolving route for identifier:', identifier);
      showLoading('Resolving route...');

      if (!identifier) {
        console.log('No identifier provided');
        setResolution({ type: 'not_found' });
        hideLoading();
        return;
      }

      try {
        // First, check if it's a username (existing profiles)
        console.log('Checking if identifier is a username...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', identifier)
          .single();

        console.log('Profile query result:', { profile, profileError });

        if (profile && !profileError) {
          console.log('Found profile, resolving as username');
          setResolution({ type: 'username', data: profile });
          hideLoading();
          return;
        }

        // If not a username, check if it's a short code
        console.log('Checking if identifier is a short code...');
        const { data: shortLink, error: shortLinkError } = await supabase
          .from('shortened_links')
          .select('*')
          .eq('short_code', identifier)
          .eq('is_active', true)
          .single();

        console.log('Short link query result:', { shortLink, shortLinkError });

        if (shortLink && !shortLinkError) {
          // Check if link has expired
          if (shortLink.expires_at && new Date(shortLink.expires_at) < new Date()) {
            console.log('Short link has expired');
            setResolution({ type: 'not_found' });
          } else {
            console.log('Found short link, resolving as short code');
            setResolution({ type: 'short_code', data: shortLink });
          }
          hideLoading();
          return;
        }

        // Neither username nor short code found
        console.log('Neither username nor short code found');
        setResolution({ type: 'not_found' });
      } catch (error) {
        console.error('Error resolving route:', error);
        setResolution({ type: 'not_found' });
      } finally {
        hideLoading();
      }
    };

    resolveRoute();
  }, [identifier, showLoading, hideLoading]);

  if (resolution?.type === 'not_found') {
    return (
      <div className="min-h-screen relative" style={{ background: 'var(--c-bg)' }}>
        <BoltBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Not Found</h2>
            <p className="text-gray-600 mb-4">The requested page or link could not be found.</p>
            <button
              onClick={() => navigate('/homepage')}
              className="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
            >
              Go Home
            </button>
          </div>
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
