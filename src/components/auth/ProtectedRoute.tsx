import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '../../lib/supabaseClient';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setHasProfile(false);
          } else {
            console.error('Error checking profile:', error);
          }
        } else {
          setHasProfile(!!profile?.username);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };

    checkProfile();
  }, [session]);

  if (!session) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  if (hasProfile === null) {
    return <div>Loading...</div>;
  }

  if (!hasProfile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasProfile && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;