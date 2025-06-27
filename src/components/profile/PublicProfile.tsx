import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import logo from "../../assets/Frame.png";
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { FaUser } from 'react-icons/fa';
import { SocialIcon } from 'react-social-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal } from "lucide-react";
import { Globe } from 'lucide-react';

interface UserProfile {
  username: string;
  bio: string;
  profile_picture: string | null;
  links: string[];
  link_title: string[];
  id: string;
}

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

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
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = btoa(Math.random().toString()).slice(0, 10);
        localStorage.setItem('visitorId', visitorId);
      }

      const { data: existingRecord } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewer_hash', visitorId)
        .eq('profile_id', profile?.id)
        .single();

      if (existingRecord) {
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
        // Optionally handle error
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setError('Profile not found');
        setProfile(null);
        return;
      }

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
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Simplified and more reliable device detection function
  const detectDeviceType = (): string => {
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
        // Optionally handle geolocation fetch error
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

  // Update getSocialIcon to accept a size parameter
  const getSocialIcon = (url: string, size: number = 25) => {
    if (typeof url !== 'string') return <Globe size={size} className="text-gray-400" />;
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      if (domain.includes('clinkr.live')) {
        return <img src={logo} alt="Clinkr" className={`w-[${size}px] h-[${size}px] rounded-full bg-white border border-indigo-200`} style={{objectFit:'contain', background:'bg-gradient-to-r from-pink-100 to-purple-100 opacity-20 blur-3xl -z-10', width: size, height: size}} />;
      }
      // Use react-social-icons for known domains
      if (/^(facebook|x|linkedin|github|instagram|youtube|tiktok|pinterest|snapchat|reddit|whatsapp|telegram|discord|medium|dribbble|behance|codepen|dev\.to|stackoverflow|twitch|slack|spotify|soundcloud|apple|google|amazon|paypal|patreon|buymeacoffee|substack|wordpress|blogspot|tumblr|flickr|vimeo|bandcamp|goodreads|kofi|strava|mastodon|kickstarter|producthunt|quora|rss|rss2|rss3|rss4|rss5)\./i.test(domain)) {
        return <SocialIcon url={url} style={{ width: size, height: size }} />;
      }
      // Otherwise, generic globe
      return <Globe size={size} className="text-gray-400" />;
    } catch {
      return <Globe size={size} className="text-gray-400" />;
    }
  };

  const links = Array.isArray(profile?.links) ? profile.links.map((url, index) => {
    // Make sure we're returning a properly structured object
    return {
      title: profile?.link_title && profile.link_title[index] ? profile.link_title[index] : url,
      clicks: 0,
      icon: getSocialIcon(url, 36), // Pass larger size
      url: url,
    };
  }) : [];

  // Ensure rendering logic correctly uses profile state
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-black" />
      <motion.div 
        className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 opacity-30 blur-3xl -z-10"
      />
      <motion.div 
        className="absolute bottom-20 right-0 w-80 h-80 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 opacity-30 blur-3xl -z-10"
        animate="animate"
        transition={{ delay: 0.5 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 opacity-20 blur-3xl -z-10"
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
        <Link to="/homepage" className="flex items-center gap-1 sm:gap-2 mt-8">
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
        initial="hidden"
        animate="visible"
      >
        {/* Profile Picture Section */}
        <motion.div 
          className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-400 p-1 flex items-center justify-center overflow-visible mb-4 relative shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(79, 70, 229, 0.4)' }}
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                <motion.div 
                  className="rounded-full h-8 w-8 border-b-2 border-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            ) : profile?.profile_picture ? (
              <motion.img
                src={profile.profile_picture}
                alt={profile.username}
                className="w-full h-full object-cover rounded-full"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ background: 'transparent' }}
              />
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <FaUser size={60} />
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
          </div>
        </motion.div>
    
  
        <motion.div className="text-center" >
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? 'Loading...' : profile?.username || 'Profile not found'}
          </motion.h1>
        </motion.div>
  
  
        <motion.div className="text-center">
          <motion.p 
            className="text-gray-700 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? 'Loading...' : profile?.bio || 'Bio not available'}
          </motion.p>
        </motion.div>
  
        {/* Links Section */}
        <motion.div 
          className="mt-8 space-y-6 max-w-xl mx-auto"
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {links.map((link, index) => (
              <motion.div 
                key={index}
                initial="hidden"
                animate="visible"
              >
                <Card className="hover:shadow-lg transition-shadow rounded-2xl border-2 border-gray-100 bg-white/80 p-2">
                  <CardContent className="flex items-center justify-between gap-2 md:gap-4 p-6">
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                      <motion.span 
                        className="flex-shrink-0"
                        whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {getSocialIcon(link.url, 36)}
                      </motion.span>
                      <div className="flex flex-col items-start flex-grow min-w-0">
                        <span className="text-lg font-semibold text-gray-900 truncate">{link.title}</span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-500 hover:text-indigo-600 transition-colors block"
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            maxWidth: '100%'
                          }}
                          onClick={(e) => handleLinkClick(link.url, index, e)}
                        >
                          <span className="block md:hidden">
                            {link.url.length > 22 ? link.url.slice(0, 19) + '...' : link.url}
                          </span>
                          <span className="hidden md:block">
                            {link.url.length > 38 ? link.url.slice(0, 35) + '...' : link.url}
                          </span>
                        </a>
                      </div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        className="p-2 rounded-full hover:bg-gradient-to-r hover:from-purple-100 hover:via-indigo-100 hover:to-blue-100 focus:outline-none transition-colors"
                        aria-label="Link actions"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenDropdownIndex(index);
                        }}
                      >
                        <MoreHorizontal className="h-5 w-5 text-gray-500" />
                      </button>
                      {openDropdownIndex === index && (
                        <div className="absolute right-0 top-full mt-2 z-50 bg-white border rounded-md shadow-lg p-2 flex flex-col min-w-[150px]">
                          <button
                            className="text-left px-4 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                            onClick={(e) => { handleLinkClick(link.url, index, e); setOpenDropdownIndex(null); }}
                          >
                            Visit this link
                          </button>
                          <button
                            className="text-left px-4 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                            onClick={() => { navigator.clipboard.writeText(link.url); setOpenDropdownIndex(null); }}
                          >
                            Copy to clipboard
                          </button>
                          <button
                            className="text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
                            onClick={() => setOpenDropdownIndex(null)}
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
  
        {/* Call to Action / Footer Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >

        </motion.div>

      </motion.div>

      {/* Footer Section */}
      <motion.footer
        className="mt-24 py-8 text-center text-gray-600 text-sm flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="mt-20 flex flex-col sm:flex-row justify-center sm:gap-5 items-center w-full max-w-2xl mx-auto">
  <a
    href="/homepage"
    className="hover:text-blue-600 hovr:underline underline-offset-4 transition-colors"
  >
    Visit Clinkr
  </a>
  <a
    href="/getstarted"
    className="hover:text-blue-600 hover:underline underline-offset-4 transition-colors"
  >
    Get Started Now
  </a>
</div>

        <p className="mt-8">&copy; {new Date().getFullYear()} Clinkr. All rights reserved.</p>
    
      </motion.footer>
    </div>  );
};

export default PublicProfile;
