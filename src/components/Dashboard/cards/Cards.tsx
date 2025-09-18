import TotalClicks from './TotalClicks';
import TopCountry from './TopCountry';
import DeviceSplit from './DeviceSplit';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCrown, FaChartLine, FaRocket } from 'react-icons/fa';

const Cards = () => {
  return (
    <div className="w-full sm:mt-10 flex flex-col h-auto min-h-20 mb-10 md:mb-20 px-6 md:px-10 py-6 md:py-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
      
      {/* Premium Analytics Teaser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-xl p-6 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <FaCrown className="text-yellow-300" size={20} />
            <h3 className="text-lg font-bold">Unlock Advanced Analytics</h3>
          </div>
          <p className="text-white/90 mb-4 text-sm">
            Get detailed insights, geographic heatmaps, device analytics, and trend analysis with Premium.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Geographic Heatmaps</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Device Analytics</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Trend Analysis</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Export Reports</span>
          </div>
          <Link to="/premiumdashboard">
            <motion.button
              className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaChartLine size={14} />
              View Premium Dashboard
            </motion.button>
          </Link>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl" />
      </motion.div>
    </div>
  );
};

export default Cards;