import React from 'react';
import { useLoading } from '../contexts/LoadingContext';
import LoadingScreen from './ui/loadingScreen';

const GlobalLoadingOverlay: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto">
      <LoadingScreen />
    </div>
  );
};

export default GlobalLoadingOverlay;
