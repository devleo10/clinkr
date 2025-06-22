import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import logo from "../../assets/Frame.png";
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { FaUser } from 'react-icons/fa';
import { SocialIcon } from 'react-social-icons';
import { motion, AnimatePresence } from 'framer-motion';
import LinkWithIcon from "../ui/linkwithicon";

interface UserProfile {
  username: string;
  bio: string;
  profile_picture: string | null;
  links: string[];
  link_title: string[];
  id: string;
}

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

const floatingOrbVariants = {
  animate: {
    y: ['-5%', '5%'],
    x: ['-2%', '2%'],
    transition: {
      y: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      },
      x: {
        duration: 4,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  }
};


const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
    };
    loadData();
  }, [username]);

  useEffect(() => {
    if (profile?.id) {
      recordView();
    }
  }, [profile?.id]);

  const recordView = async () => {
    try {
      console.log('Starting view recording for profile:', profile?.id);
      
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = btoa(Math.random().toString()).slice(0, 10);
        console.log('Generated new visitorId:', visitorId);
        localStorage.setItem('visitorId', visitorId);
      }

      const { data: existingRecord, error: fetchError } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewer_hash', visitorId)
        .eq('profile_id', profile?.id)
        .single();
  
      console.log('Existing record check:', { existingRecord, fetchError });
  
      if (existingRecord) {
        console.log('Skipping duplicate view from:', visitorId);
        return;
      }
  
      const { error: insertError } = await supabase
        .from('profile_views')
        .insert({
          viewer_hash: visitorId,
          profile_id: profile?.id,
          viewed_at: new Date().toISOString()
        });
  
      if (insertError) {
        console.error('Insert error details:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details
        });
      } else {
        console.log('Successfully recorded view for profile:', profile?.id);
      }
    } catch (err) {
      console.error('View recording crash:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for username:', username);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();
  
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
  
      if (!data) {
        console.log('Profile not found for username:', username);
        setError('Profile not found');
        setProfile(null);
        return;
      }
  
      console.log('Profile data fetched:', data);
  
      const profileData: UserProfile = {
        id: data.id,
        username: data.username || '',
        bio: data.bio || '',
        profile_picture: data.profile_picture,
        links: Array.isArray(data.links) ? data.links : (data.links ? JSON.parse(data.links) : []),
        link_title: Array.isArray(data.link_title) ? data.link_title : (data.link_title ? JSON.parse(data.link_title) : []),
      };
  
      setProfile(profileData);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Simplified and more reliable device detection function
  const detectDeviceType = (): string => {
    // Add console log to help with debugging
    console.log('User Agent:', navigator.userAgent);
    
    // First, check if navigator.userAgentData is available (modern browsers)
    if ('userAgentData' in navigator && (navigator as any).userAgentData?.mobile) {
      return 'mobile';
    }
    
    const userAgent = navigator.userAgent;
    
    // Simple and reliable mobile detection
    if (/Mobi|Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    // Tablet detection
    if (/iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    // Use a very simple screen width threshold as a fallback
    // Most mobile devices have screen width less than 768px
    if (window.innerWidth <= 768 && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    // Default to desktop - if we haven't detected mobile or tablet by now
    return 'desktop';
  };

  // Completely rewritten browser detection that always returns a value
  const detectBrowser = (): string => {
    // Add console log to help with debugging
    console.log('User Agent:', navigator.userAgent);
    console.log('Vendor:', navigator.vendor);
    
    const userAgent = navigator.userAgent;
    
    // Most reliable pattern matching, in order from most to least specific
    if (userAgent.indexOf("Firefox") !== -1) {
      return "Firefox";
    }
    
    if (userAgent.indexOf("SamsungBrowser") !== -1) {
      return "Samsung Internet";
    }
    
    if (userAgent.indexOf("Opera") !== -1 || userAgent.indexOf("OPR") !== -1) {
      return "Opera";
    }
    
    if (userAgent.indexOf("Edg") !== -1) {
      return "Edge";
    }
    
    if (userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1) {
      return "Internet Explorer";
    }
    
    if (userAgent.indexOf("Chrome") !== -1) {
      return "Chrome";
    }
    
    if (userAgent.indexOf("Safari") !== -1) {
      return "Safari";
    }
    
    if (userAgent.indexOf("UCBrowser") !== -1) {
      return "UC Browser";
    }
    
    // Fallback - should rarely happen with modern browsers
    return "Unknown";
  };

  const handleLinkClick = async (url: string, index: number, e: React.MouseEvent) => {
    try {
      // Prevent the default navigation temporarily
      e.preventDefault();
      
      if (!profile || !profile.id) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
    
      // Get visitor information with improved detection
      const deviceType = detectDeviceType();
      const browser = detectBrowser();
      
      // Get geolocation data
      let lat = null;
      let lng = null;
      let countryCode = null;
      let region = null;
      
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        lat = data.latitude;
        lng = data.longitude;
        countryCode = data.country_code;
        region = data.region;
      } catch (geoError) {
        console.error('Failed to fetch geolocation data:', geoError);
      }
    
      // Record the click in the link_analytics table
      const { error } = await supabase
        .from('link_analytics')
        .insert({
          profile_id: profile.id,
          user_id: profile.id,
          link_url: url,
          link_index: index,
          device_type: deviceType,
          browser: browser,
          event_type: 'click',
          referrer: document.referrer || 'direct',
          lat: lat,
          lng: lng,
          country_code: countryCode,
          region: region,
        });
    
      if (error) {
        console.error('Error recording click:', error);
      }
      
      // Now navigate to the URL
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to record click:', err);
      // Ensure navigation happens even if tracking fails
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Replace the getSocialIcon function with this new version
  const getSocialIcon = (url: string) => {
    if (typeof url !== 'string') return <SocialIcon url="https://example.com" style={{ width: 25, height: 25 }} />;
    return <SocialIcon url={url} style={{ width: 25, height: 25 }} />;
  };

  const links = Array.isArray(profile?.links) ? profile.links.map((url, index) => {
    // Make sure we're returning a properly structured object
    return {
      title: profile?.link_title && profile.link_title[index] ? profile.link_title[index] : url,
      clicks: 0,
      icon: getSocialIcon(url),
      url: url,
    };
  }) : [];

  // Ensure rendering logic correctly uses profile state
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 opacity-30 blur-3xl -z-10"
        variants={floatingOrbVariants}
        animate="animate"
      />
      <motion.div 
        className="absolute bottom-20 right-0 w-80 h-80 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 opacity-30 blur-3xl -z-10"
        variants={floatingOrbVariants}
        animate="animate"
        transition={{ delay: 0.5 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 opacity-20 blur-3xl -z-10"
        variants={floatingOrbVariants}
        animate="animate"
        transition={{ delay: 1 }}
      />
      
      {/* Header Section */}
      <motion.div 
        className="flex justify-center items-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/homepage" className="flex items-center gap-1 sm:gap-2">
              <img 
                src={logo} 
                alt="Clinkr Logo" 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold relative group">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300">
                  Clinkr
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </h1>
            </Link>
      </motion.div>
  
      {/* Profile Content */}
      <motion.div 
        className="text-center relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Picture Section */}
        <motion.div 
          className="w-24 h-24 mx-auto rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 relative"
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(79, 70, 229, 0.3)' }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <motion.div 
                className="rounded-full h-8 w-8 border-b-2 border-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : profile?.profile_picture ? (
            <motion.img
              src={profile.profile_picture}
              alt={profile.username}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FaUser size={40} />
            </motion.div>
          )}
          {error && (
            <motion.div 
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 text-xs py-1 px-2 rounded-md whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {error}
            </motion.div>
          )}
        </motion.div>
  
        <motion.div className="text-center" variants={itemVariants}>
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? 'Loading...' : profile?.username || 'Profile not found'}
          </motion.h1>
        </motion.div>
  
        <motion.div 
          className="flex items-center justify-center gap-2 mb-2"
          variants={itemVariants}
        >
          <motion.p 
            className="text-[#4F46E5]"
            whileHover={{ scale: 1.05 }}
          >
            @{loading ? 'Loading...' : profile?.username || 'Profile not found'}
          </motion.p>
        </motion.div>
  
        <motion.div className="text-center" variants={itemVariants}>
          <motion.p 
            className="text-gray-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? 'Loading...' : profile?.bio || 'Bio not available'}
          </motion.p>
        </motion.div>
  
        {/* Links Section */}
        <motion.div 
          className="mt-6 space-y-4 max-w-md mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {links.map((link, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.02 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <motion.span 
                        className="flex-shrink-0"
                        whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                       <LinkWithIcon url={link.url} />
                      </motion.span>
                      <motion.a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-[#4F46E5] transition-colors truncate"
                        onClick={(e) => handleLinkClick(link.url, index, e)}
                        whileHover={{ x: 3 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {link.title}
                      </motion.a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      
      </motion.div>
    </div>
  );
};

export default PublicProfile;