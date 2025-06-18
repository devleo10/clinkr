import { FaQuestionCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

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
    <div className="w-full border-2 p-5 rounded-[10px] hover:border-[#4F46E5] flex flex-col justify-between min-h-[150px]">
      <div className="flex justify-between items-center">
        <h1>Device Split</h1>
        <FaQuestionCircle size={32} />
      </div>
      <div className="flex gap-10 mt-4">
        <div className="text-center">
          <p className="text-gray-500">Mobile</p>
          <p className="font-bold text-lg">
            {loading ? '...' : `${deviceData.mobile}%`}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Desktop</p>
          <p className="font-bold text-lg">
            {loading ? '...' : `${deviceData.desktop}%`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DeviceSplit;