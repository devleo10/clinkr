// Utility function to get the base URL of the application
// Add production check
export const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    // Use actual host in production
    if (window.location.hostname !== 'localhost') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    // Local development handling
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${host}${port}`;
  }
  return process.env.VITE_APP_URL || 'http://192.168.249.43:5173/';
};

// Utility function to generate OAuth redirect URLs
export const getRedirectUrl = (path: string) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};