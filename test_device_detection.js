// Test Device Detection Functions
// Run this in browser console to test device detection

function detectDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for mobile devices first
  if (/android|iphone|ipad|ipod|mobile|blackberry|windows phone/.test(userAgent)) {
    // Distinguish between mobile and tablet
    if (/ipad|tablet|kindle|playbook|silk/.test(userAgent)) {
      return 'tablet';
    }
    return 'mobile';
  }
  
  // Check for desktop devices
  if (/windows|macintosh|mac os x|linux|ubuntu|fedora|debian/.test(userAgent)) {
    return 'desktop';
  }
  
  return 'desktop'; // Default to desktop for unknown devices
}

function detectBrowser(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return 'Chrome';
  }
  if (userAgent.includes('firefox')) {
    return 'Firefox';
  }
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'Safari';
  }
  if (userAgent.includes('edg')) {
    return 'Edge';
  }
  if (userAgent.includes('opera') || userAgent.includes('opr')) {
    return 'Opera';
  }
  
  return 'Unknown';
}

// Test the functions
console.log('User Agent:', navigator.userAgent);
console.log('Detected Device Type:', detectDeviceType());
console.log('Detected Browser:', detectBrowser());

// Test with different user agents
const testUserAgents = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0'
];

console.log('\nTesting different user agents:');
testUserAgents.forEach((ua, index) => {
  const originalUA = navigator.userAgent;
  Object.defineProperty(navigator, 'userAgent', {
    get: () => ua,
    configurable: true
  });
  
  console.log(`Test ${index + 1}: ${ua}`);
  console.log(`  Device: ${detectDeviceType()}`);
  console.log(`  Browser: ${detectBrowser()}`);
  
  // Restore original user agent
  Object.defineProperty(navigator, 'userAgent', {
    get: () => originalUA,
    configurable: true
  });
});
