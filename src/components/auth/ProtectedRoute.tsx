import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useLoading } from '../../contexts/LoadingContext';
import { supabase } from '../../lib/supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth: boolean;
  requireProfile?: boolean;
}

const ProtectedRoute = ({ children, requireAuth, requireProfile = false }: ProtectedRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileCheckComplete, setProfileCheckComplete] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) {
        showLoading('Verifying session...');
        return; // Wait for auth to load
      }

      setProfileCheckComplete(false);

      if (!session?.user?.id) {
        setHasProfile(false);
        setProfileCheckComplete(true);
        hideLoading();
        return;
      }

      if (!requireProfile) {
        setHasProfile(true);
        setProfileCheckComplete(true);
        hideLoading();
        return;
      }

      try {
        showLoading('Checking profile...');
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (error) {
          setHasProfile(false);
        } else {
          setHasProfile(!!profile?.username);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setHasProfile(false);
      } finally {
        setProfileCheckComplete(true);
        hideLoading();
      }
    };

    checkProfile();
  }, [session, requireProfile, showLoading, hideLoading]);

  if (authLoading || !profileCheckComplete) {
    return null; // Global loading overlay will handle this
  }

  // If auth is required and there's no session, redirect to signup
  if (requireAuth && !session) {
    return <Navigate to="/getstarted" state={{ from: location }} replace />;
  }

  // If profile is required and user doesn't have one, redirect to onboarding
  if (requireProfile && !hasProfile) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;