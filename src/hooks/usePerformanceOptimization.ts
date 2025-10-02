import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { analyzeBundleSize } from '../utils/bundleAnalyzer';

interface PerformanceOptimizationOptions {
  enableVirtualization?: boolean;
  enableDebouncing?: boolean;
  debounceDelay?: number;
  enableMemoization?: boolean;
  enableLazyLoading?: boolean;
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentCount: number;
}

export const usePerformanceOptimization = (options: PerformanceOptimizationOptions = {}) => {
  const {
    enableVirtualization = false,
    enableDebouncing = true,
    debounceDelay = 300,
    enableMemoization = true,
    enableLazyLoading = true
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0
  });

  const [isLowPerformance, setIsLowPerformance] = useState(false);

  // Initialize bundle analyzer in development
  const bundleAnalyzer = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      return analyzeBundleSize();
    }
    return null;
  }, []);

  // Detect low performance devices
  useEffect(() => {
    const checkPerformance = () => {
      const connection = (navigator as any).connection;
      const memory = (performance as any).memory;
      
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.downlink < 1
      );
      
      const isLowMemory = memory && memory.usedJSHeapSize > 50 * 1024 * 1024; // 50MB
      
      const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      
      setIsLowPerformance(isSlowConnection || isLowMemory || isLowEndDevice);
    };

    checkPerformance();
    
    // Recheck periodically
    const interval = setInterval(checkPerformance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Debounced function creator
  const createDebouncedFunction = useCallback(
    <T extends (...args: any[]) => any>(func: T): T => {
      if (!enableDebouncing) return func;
      
      let timeoutId: NodeJS.Timeout;
      return ((...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), debounceDelay);
      }) as T;
    },
    [enableDebouncing, debounceDelay]
  );

  // Memoized value creator
  const createMemoizedValue = useCallback(
    <T>(factory: () => T, deps: React.DependencyList): T => {
      if (!enableMemoization) return factory();
      return useMemo(factory, deps);
    },
    [enableMemoization]
  );

  // Lazy loading helper
  const createLazyComponent = useCallback(
    <T extends React.ComponentType<any>>(importFunc: () => Promise<{ default: T }>) => {
      if (!enableLazyLoading) {
        return importFunc().then(module => module.default);
      }
      
      return React.lazy(importFunc);
    },
    [enableLazyLoading]
  );

  // Performance monitoring
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    const renderTime = end - start;
    setMetrics(prev => ({
      ...prev,
      renderTime
    }));
    
    // Track with bundle analyzer if available
    if (bundleAnalyzer) {
      bundleAnalyzer.trackRenderTime(name, renderTime);
    }
    
    if (renderTime > 16) { // More than one frame
      // Performance warning logged
    }
  }, [bundleAnalyzer]);

  // Optimized scroll handler
  const createOptimizedScrollHandler = useCallback(
    (handler: (event: Event) => void) => {
      let ticking = false;
      
      return (event: Event) => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handler(event);
            ticking = false;
          });
          ticking = true;
        }
      };
    },
    []
  );

  // Intersection Observer for lazy loading
  const createIntersectionObserver = useCallback(
    (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
      if (!enableLazyLoading || !('IntersectionObserver' in window)) {
        return null;
      }
      
      return new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      });
    },
    [enableLazyLoading]
  );

  return {
    // State
    isLowPerformance,
    metrics,
    
    // Performance flags
    simplifiedAnimations: isLowPerformance,
    reducedMotion: isLowPerformance,
    enableVirtualization: enableVirtualization && !isLowPerformance,
    
    // Utilities
    createDebouncedFunction,
    createMemoizedValue,
    createLazyComponent,
    measurePerformance,
    createOptimizedScrollHandler,
    createIntersectionObserver,
    
    // Bundle analyzer (development only)
    bundleAnalyzer,
    
    // Performance recommendations
    recommendations: {
      useSimplifiedAnimations: isLowPerformance,
      reduceImageQuality: isLowPerformance,
      enableCodeSplitting: enableLazyLoading,
      useMemoization: enableMemoization,
      enableDebouncing: enableDebouncing
    }
  };
};

export default usePerformanceOptimization;