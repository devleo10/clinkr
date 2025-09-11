import { useEffect, useState } from 'react';

interface PerformanceConfig {
  reduceAnimations: boolean;
  disableBackgroundEffects: boolean;
  simplifiedAnimations: boolean;
}

export const usePerformanceOptimization = (): PerformanceConfig => {
  const [config, setConfig] = useState<PerformanceConfig>({
    reduceAnimations: false,
    disableBackgroundEffects: false,
    simplifiedAnimations: false,
  });

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const isMobile = window.innerWidth <= 768;
    
    // Check for slow connection
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    
    setConfig({
      reduceAnimations: prefersReducedMotion || Boolean(isLowEndDevice),
      disableBackgroundEffects: isMobile || isSlowConnection,
      simplifiedAnimations: isMobile || isLowEndDevice || isSlowConnection,
    });
  }, []);

  return config;
};

export default usePerformanceOptimization;
