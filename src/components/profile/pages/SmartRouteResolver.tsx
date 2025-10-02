import { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import ShortenedLinkRedirect from './ShortenedLinkRedirect';
import { useLoading } from '../../../contexts/LoadingContext';
import BoltBackground from '../../homepage/BoltBackground';
import LoadingScreen from '../../ui/loadingScreen';

// Lazy load profile components for better performance
const PublicProfile = lazy(() => import('./PublicProfile'));

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
      // Only show loading for username resolution, not for short codes
      const isLikelyShortCode = identifier && identifier.length > 3 && !identifier.includes(' ');
      if (!isLikelyShortCode) {
        showLoading('Resolving route...');
      }

      if (!identifier) {
        setResolution({ type: 'not_found' });
        hideLoading();
        return;
      }

      try {
        // If it looks like a short code, check short codes first
        if (isLikelyShortCode) {
          // Checking if identifier is a short code
          const { data: shortLink, error: shortLinkError } = await supabase
            .from('shortened_links')
            .select('*')
            .eq('short_code', identifier)
            .eq('is_active', true)
            .single();

          // Short link query completed

          if (shortLink && !shortLinkError) {
            // Check if link has expired
            if (shortLink.expires_at && new Date(shortLink.expires_at) < new Date()) {
              // Short link has expired
              setResolution({ type: 'not_found' });
            } else {
              // Found short link, resolving as short code
              setResolution({ type: 'short_code', data: shortLink });
            }
            hideLoading();
            return;
          }
        }

        // Check if it's a username (existing profiles)
        // Checking if identifier is a username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', identifier)
          .single();

        // Profile query completed

        if (profile && !profileError) {
          // Found profile, resolving as username
          setResolution({ type: 'username', data: profile });
          hideLoading();
          return;
        }

        // If not a username and not checked as short code yet, check short codes
        if (!isLikelyShortCode) {
          // Not a username, checking if identifier is a short code
          const { data: shortLink, error: shortLinkError } = await supabase
            .from('shortened_links')
            .select('*')
            .eq('short_code', identifier)
            .eq('is_active', true)
            .single();

          // Short link query completed

          if (shortLink && !shortLinkError) {
            // Check if link has expired
            if (shortLink.expires_at && new Date(shortLink.expires_at) < new Date()) {
              // Short link has expired
              setResolution({ type: 'not_found' });
            } else {
              // Found short link, resolving as short code
              setResolution({ type: 'short_code', data: shortLink });
            }
            hideLoading();
            return;
          }
        }

        // Neither username nor short code found
        setResolution({ type: 'not_found' });
      } catch (error) {
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
    // Found profile, rendering PublicProfile
    return (
      <Suspense fallback={<LoadingScreen compact />}>
        <PublicProfile />
      </Suspense>
    );
  }

  if (resolution?.type === 'short_code') {
    return <ShortenedLinkRedirect shortLink={resolution.data} />;
  }

  return null;
};

export default SmartRouteResolver;
