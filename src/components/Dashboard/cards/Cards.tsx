import React from 'react';
import TotalClicks from './TotalClicks';
import ProfileViews from './ProfileViews';
import TopCountry from './TopCountry';
import DeviceSplit from './DeviceSplit';

const Cards = () => {
  return (
    <div className="w-full sm:mt-10 flex flex-col h-auto min-h-20 mb-10 md:mb-20 px-6 md:px-10 py-6 md:py-0">
      {/* Main metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6">
        <div style={{ willChange: 'transform' }}>
          <TotalClicks />
        </div>
        <div style={{ willChange: 'transform' }}>
          <TopCountry />
        </div>
        <div style={{ willChange: 'transform' }}>
          <DeviceSplit />
        </div>
      </div>
      
      {/* Detailed analytics row */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:gap-8">
        <div style={{ willChange: 'transform' }}>
          <ProfileViews />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Cards);