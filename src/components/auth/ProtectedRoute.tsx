import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import LoadingScreen from '../ui/loadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth: boolean;
  requireProfile?: boolean;
}

const ProtectedRoute = ({ children, requireAuth, requireProfile = false }: ProtectedRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileCheckComplete, setProfileCheckComplete] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) {
        return; // Wait for auth to load
      }

      setProfileCheckComplete(false);

      if (!session?.user?.id) {
        setHasProfile(false);
        setProfileCheckComplete(true);
        return;
      }

      if (!requireProfile) {
        setHasProfile(true);
        setProfileCheckComplete(true);
        return;
      }

      try {
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
      }
    };

    checkProfile();
  }, [session, requireProfile]);

  if (authLoading || !profileCheckComplete) {
    return <LoadingScreen />;
  }

  // If auth is required and there's no session, redirect to signup
  if (requireAuth && !session) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  // If profile is required and user doesn't have one, redirect to onboarding
  if (requireProfile && !hasProfile) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;