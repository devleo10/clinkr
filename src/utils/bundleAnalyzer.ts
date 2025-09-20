import React from 'react';

// Bundle analysis utilities for development
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Monitor dynamic imports
  const dynamicImports = new Map<string, number>();
  
  const trackDynamicImport = (name: string, startTime: number) => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    dynamicImports.set(name, loadTime);
    
    console.log(`📦 Dynamic import "${name}" loaded in ${loadTime.toFixed(2)}ms`);
    
    if (loadTime > 1000) {
      console.warn(`⚠️ Slow dynamic import: "${name}" took ${loadTime.toFixed(2)}ms`);
    }
  };

  // Monitor component render times
  const renderTimes = new Map<string, number[]>();
  
  const trackRenderTime = (componentName: string, renderTime: number) => {
    if (!renderTimes.has(componentName)) {
      renderTimes.set(componentName, []);
    }
    
    const times = renderTimes.get(componentName)!;
    times.push(renderTime);
    
    // Keep only last 10 measurements
    if (times.length > 10) {
      times.shift();
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    if (renderTime > 16) { // More than one frame
      console.warn(`🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (avg: ${avgTime.toFixed(2)}ms)`);
    }
  };

  // Memory usage monitoring
  const monitorMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      
      if (usedMB > 100) { // More than 100MB
        console.warn(`🧠 High memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
      }
    }
  };

  // Network performance monitoring
  const monitorNetworkPerformance = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
        console.warn(`🌐 Slow network detected: ${effectiveType} (${downlink}Mbps)`);
      }
    }
  };

  // Performance recommendations
  const getPerformanceRecommendations = () => {
    const recommendations: string[] = [];
    
    // Check for slow dynamic imports
    for (const [name, time] of dynamicImports) {
      if (time > 1000) {
        recommendations.push(`Consider code splitting "${name}" - took ${time.toFixed(2)}ms`);
      }
    }
    
    // Check for slow renders
    for (const [component, times] of renderTimes) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      if (avgTime > 16) {
        recommendations.push(`Optimize "${component}" rendering - avg ${avgTime.toFixed(2)}ms`);
      }
    }
    
    // Check memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      if (usedMB > 100) {
        recommendations.push(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
      }
    }
    
    return recommendations;
  };

  // Export performance report
  const generatePerformanceReport = () => {
    const report = {
      dynamicImports: Object.fromEntries(dynamicImports),
      renderTimes: Object.fromEntries(
        Array.from(renderTimes.entries()).map(([name, times]) => [
          name, 
          {
            average: times.reduce((a, b) => a + b, 0) / times.length,
            max: Math.max(...times),
            min: Math.min(...times),
            count: times.length
          }
        ])
      ),
      recommendations: getPerformanceRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Performance Report:', report);
    return report;
  };

  return {
    trackDynamicImport,
    trackRenderTime,
    monitorMemoryUsage,
    monitorNetworkPerformance,
    generatePerformanceReport
  };
};

// React component wrapper for performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${name} rendered in ${renderTime.toFixed(2)}ms`);
      }
    });
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${name})`;
  return WrappedComponent;
};

export default analyzeBundleSize;
