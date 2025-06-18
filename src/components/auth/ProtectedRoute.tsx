import { useEffect, useState } from 'react';
import { Navigate} from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);


  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('Auth check failed: No user or auth error');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Check if user has completed their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')  // Select all fields to debug
        .eq('id', user.id)
        .single();

      console.log('Profile check result:', { profile, profileError });

      if (profileError) {
        console.error('Profile check error:', profileError);
        setHasProfile(false);
      } else if (!profile || !profile.username || !profile.full_name) {
        console.log('Profile incomplete:', profile);
        setHasProfile(false);
      } else {
        console.log('Valid profile found:', profile);
        setHasProfile(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // You could return a loading spinner here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;