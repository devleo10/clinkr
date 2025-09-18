import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useLoading } from '../../contexts/LoadingContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth: boolean;
  requireProfile?: boolean;
}

const ProtectedRoute = ({ children, requireAuth, requireProfile = false }: ProtectedRouteProps) => {
  const { session, loading: authLoading, hasProfile } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (authLoading) {
      showLoading('Verifying session...');
      setIsReady(false);
    } else {
      hideLoading();
      // Add a small delay to prevent rapid state changes
      setTimeout(() => setIsReady(true), 100);
    }
  }, [authLoading, showLoading, hideLoading]);

  // Don't render anything until we're ready
  if (!isReady) {
    return null;
  }

  // If auth is required and there's no session, redirect to signup
  if (requireAuth && !session) {
    return <Navigate to="/getstarted" state={{ from: location }} replace />;
  }

  // If profile is required and user doesn't have one, redirect to onboarding
  if (requireProfile && hasProfile === false) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;