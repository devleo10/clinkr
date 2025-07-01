import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import logo from "../../assets/Frame.png";
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal } from "lucide-react";
import { Globe } from 'lucide-react';
import PublicProfileBackground from './PublicProfileBackground';

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
      // Try to fetch favicon/logo for all other domains
      return (
        <img
          src={`https://logo.clearbit.com/${domain}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
          }}
          alt={`${domain} icon`}
          style={{ width: size, height: size, borderRadius: '50%', background: '#fff', objectFit: 'contain', border: '1px solid #e0e7ff' }}
        />
      );
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <PublicProfileBackground variant="light" />
      
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <motion.div 
          className="flex justify-center items-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/homepage" className="flex items-center gap-1 sm:gap-2 mt-8">
            <motion.img 
              src={logo} 
              alt="Clinkr Logo" 
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
            <motion.h1 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300">
                Clinkr
              </span>
              <motion.div 
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500" 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              ></motion.div>
            </motion.h1>
          </Link>
        </motion.div>
  
        {/* Profile Content */}
        <motion.div 
          className="glass-card bg-white/40 backdrop-blur-lg border border-white/50 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.15)" }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-70" />
          
          {/* Animated accent */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          {/* Corner decoration */}
          <motion.div
            className="absolute top-0 right-0 w-20 h-20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-bl-full" />
          </motion.div>
          
          <div className="text-center relative z-10">
            {/* Profile Picture Section */}
            <motion.div 
              className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-400 p-1 flex items-center justify-center overflow-visible mb-6 relative shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(79, 70, 229, 0.4)' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-400 opacity-50 blur-md"></div>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative z-10">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                    <motion.div 
                      className="rounded-full h-10 w-10 border-b-2 border-t-2 border-indigo-600"
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
                    className="bg-gradient-to-r from-indigo-100 to-blue-100 w-full h-full flex items-center justify-center"
                  >
                    <FaUser size={64} className="text-indigo-600" />
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
        
            <motion.div className="text-center mt-4">
              <motion.h1 
                className="text-2xl sm:text-3xl font-bold text-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {loading ? (
                  <div className="inline-flex items-center gap-2">
                    <span>Loading</span>
                    <motion.span 
                      animate={{ opacity: [0, 1, 0] }} 
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >...</motion.span>
                  </div>
                ) : (
                  <span className="relative">
                    {profile?.username || 'Profile not found'}
                    <motion.div 
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "100%", opacity: 0.7 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    />
                  </span>
                )}
              </motion.h1>
            </motion.div>
      
            <motion.div className="text-center max-w-lg mx-auto">
              <motion.p 
                className="text-gray-600 mt-4 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {loading ? (
                  <div className="h-4 w-2/3 mx-auto bg-gray-200 animate-pulse rounded-full"></div>
                ) : (
                  profile?.bio || 'Bio not available'
                )}
              </motion.p>
            </motion.div>
      
            {/* Links Section */}
            <motion.div 
              className="mt-10 space-y-4 max-w-xl mx-auto"
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {links.map((link, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 rounded-xl border border-white/40 bg-white/90 backdrop-blur-lg overflow-hidden">
                      <CardContent className="flex items-center justify-between gap-3 md:gap-4 p-4 relative">
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-transparent to-purple-50/40 opacity-70" />
                        
                        {/* Link content */}
                        <div className="flex items-center gap-4 flex-grow min-w-0 relative z-10">
                          <motion.div 
                            className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm border border-indigo-100 flex items-center justify-center overflow-hidden"
                            whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {getSocialIcon(link.url, 36)}
                          </motion.div>
                          <div className="flex flex-col items-start flex-grow min-w-0">
                            <span className="text-lg font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{link.title}</span>
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
                              <motion.span 
                                className="inline-flex items-center gap-1"
                                whileHover={{ x: 3 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <span className="block md:hidden">
                                  {link.url.length > 22 ? link.url.slice(0, 19) + '...' : link.url}
                                </span>
                                <span className="hidden md:block">
                                  {link.url.length > 38 ? link.url.slice(0, 35) + '...' : link.url}
                                </span>
                              </motion.span>
                            </a>
                          </div>
                        </div>
                        <div className="relative flex-shrink-0 z-20">
                          <motion.button
                            className="p-2 rounded-full hover:bg-gradient-to-r hover:from-purple-100 hover:via-indigo-100 hover:to-blue-100 focus:outline-none transition-colors"
                            aria-label="Link actions"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.preventDefault();
                              setOpenDropdownIndex(index === openDropdownIndex ? null : index);
                            }}
                          >
                            <MoreHorizontal className="h-5 w-5 text-gray-500" />
                          </motion.button>
                          
                          <AnimatePresence>
                            {openDropdownIndex === index && (
                              <motion.div 
                                className="absolute right-0 top-full mt-2 z-50 bg-white/95 backdrop-blur-md border border-indigo-100/50 rounded-lg shadow-xl p-1 flex flex-col min-w-[180px] overflow-hidden"
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                              >
                                <motion.button
                                  className="text-left px-4 py-3 text-sm hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-2"
                                  onClick={(e) => { handleLinkClick(link.url, index, e); setOpenDropdownIndex(null); }}
                                  whileHover={{ x: 2 }}
                                >
                                  <Globe size={14} className="text-indigo-500" />
                                  <span>Visit this link</span>
                                </motion.button>
                                <motion.button
                                  className="text-left px-4 py-3 text-sm hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-2"
                                  onClick={() => { 
                                    navigator.clipboard.writeText(link.url); 
                                    setOpenDropdownIndex(null);
                                    // Show toast notification here if you want
                                  }}
                                  whileHover={{ x: 2 }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                  <span>Copy to clipboard</span>
                                </motion.button>
                                <motion.button
                                  className="text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2 mt-1"
                                  onClick={() => setOpenDropdownIndex(null)}
                                  whileHover={{ x: 2 }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                  <span>Close</span>
                                </motion.button>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
          </div>
        </motion.div>

        {/* Footer Section */}
        <motion.footer
          className="mt-24 py-8 text-center text-white/70 text-sm flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="mt-20 flex flex-col sm:flex-row justify-center sm:gap-5 items-center w-full max-w-2xl mx-auto">
            <a
              href="/homepage"
              className="hover:text-blue-400 hover:underline underline-offset-4 transition-colors"
            >
              Visit Clinkr
            </a>
            <a
              href="/getstarted"
              className="hover:text-blue-400 hover:underline underline-offset-4 transition-colors"
            >
              Get Started Now
            </a>
          </div>

          <p className="mt-8">&copy; {new Date().getFullYear()} Clinkr. All rights reserved.</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default PublicProfile;
