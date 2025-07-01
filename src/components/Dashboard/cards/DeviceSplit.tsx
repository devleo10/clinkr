import { FaLaptop, FaMobileAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { motion } from 'framer-motion';

const DeviceSplit = () => {
  const [deviceData, setDeviceData] = useState({
    mobile: 0,
    desktop: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviceData();
  }, []);

  const fetchDeviceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('link_analytics')
        .select('device_type')
        .eq('profile_id', user.id);

      if (error) throw error;

      // Calculate device percentages
      const total = data.length;
      if (total === 0) {
        setDeviceData({ mobile: 0, desktop: 0 });
        return;
      }

      const mobileCount = data.filter(d => d.device_type === 'mobile').length;
      const desktopCount = data.filter(d => d.device_type === 'desktop').length;

      setDeviceData({
        mobile: Math.round((mobileCount / total) * 100),
        desktop: Math.round((desktopCount / total) * 100)
      });
    } catch (error) {
      console.error('Error fetching device data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="w-full glass-card bg-white/80 backdrop-blur-lg border border-white/30 p-6 rounded-xl hover:border-indigo-200 flex flex-col justify-between min-h-[180px] shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.2)"
      }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
      
      {/* Animated accent */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      
      <div className="flex justify-between items-center relative z-10">
        <h1 className="font-bold text-gray-800">Device Split</h1>
        <div className="flex space-x-2 text-indigo-500">
          <FaMobileAlt size={18} />
          <FaLaptop size={18} />
        </div>
      </div>
      <div className="flex gap-10 mt-4 relative z-10">
        <div className="text-center flex-1">
          <div className="flex items-center justify-center mb-2">
            <FaMobileAlt className="text-indigo-600 mr-2" size={16} />
            <p className="text-gray-700 font-medium">Mobile</p>
          </div>
          <p className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">
            {loading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ...
              </motion.span>
            ) : (
              `${deviceData.mobile}%`
            )}
          </p>
        </div>
        <div className="text-center flex-1">
          <div className="flex items-center justify-center mb-2">
            <FaLaptop className="text-indigo-600 mr-2" size={16} />
            <p className="text-gray-700 font-medium">Desktop</p>
          </div>
          <p className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">
            {loading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ...
              </motion.span>
            ) : (
              `${deviceData.desktop}%`
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default DeviceSplit;