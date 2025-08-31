import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../ui/card";
import logo from "../../assets/Frame.png";
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { FaUser, FaRocket, FaHandSparkles } from 'react-icons/fa';
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
  const [activeLinkMenu, setActiveLinkMenu] = useState<number | null>(null);
  const linkMenuRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeLinkMenu !== null) {
        const linkMenuRef = linkMenuRefs.current[activeLinkMenu];
        if (linkMenuRef && !linkMenuRef.contains(event.target as Node)) {
          setActiveLinkMenu(null);
        }
      }
    };

    if (activeLinkMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeLinkMenu]);

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
    };
    loadData();
  }, [username]);

  useEffect(() => {
    console.log('Profile ID:', profile?.id); // Debugging profile ID
    if (profile?.id) {
      recordView();
    }
  }, [profile?.id]);

  useEffect(() => {
    console.log('Profile page accessed'); // Debugging profile page access
    console.log('Referrer:', document.referrer || 'No referrer'); // Debugging referrer source
    if (profile?.id) {
      recordView();
    }
  }, [profile?.id]);

  const recordView = async () => {
    try {
        console.log('recordView function called'); // Debugging function call

        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = btoa(Math.random().toString()).slice(0, 10);
            localStorage.setItem('visitorId', visitorId);
        }

        console.log('Visitor ID:', visitorId); // Debugging visitor ID

        if (!profile?.id) {
            console.error('Profile ID is missing. Cannot record view.');
            return;
        }

        let referrer = document.referrer || 'direct';
        try {
            const referrerUrl = new URL(referrer);
            referrer = referrerUrl.hostname.replace(/^www\./, '');
        } catch (error) {
            console.error('Error parsing referrer URL:', error);
        }

        console.log('Recording view data:', {
            viewer_hash: visitorId,
            profile_id: profile.id,
            viewed_at: new Date().toISOString(),
            referrer: referrer
        });

        const { error: insertError } = await supabase
            .from('profile_views')
            .insert({
                viewer_hash: visitorId,
                profile_id: profile.id,
                viewed_at: new Date().toISOString(),
                referrer: referrer
            });

        if (insertError) {
            console.error('Error inserting view:', insertError);
        } else {
            console.log('View successfully recorded'); // Debugging successful view recording
        }

    } catch (err) {
        console.error('Error in recordView function:', err);
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

  const detectDeviceType = (): string => {
    if ('userAgentData' in navigator && (navigator as any).userAgentData?.mobile) {
      return 'mobile';
    }
    const userAgent = navigator.userAgent;
    if (/Mobi|Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    if (/iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (window.innerWidth <= 768 && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  const detectBrowser = (): string => {
    const userAgent = navigator.userAgent;
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
    return "Unknown";
  };

  const handleLinkClick = async (url: string, index: number, e: React.MouseEvent) => {
    try {
        e.preventDefault();

        if (!profile || !profile.id) {
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        const deviceType = detectDeviceType();
        const browser = detectBrowser();

        let lat: number | null = null;
        let lng: number | null = null;
        let countryCode: string | null = null;
        let region: string | null = null;

        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            lat = data.latitude;
            lng = data.longitude;
            countryCode = data.country_code;
            region = data.region;
        } catch (geoError) {
            console.error('Geolocation fetch error:', geoError);
        }

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
                lat: lat,
                lng: lng,
                country_code: countryCode,
                region: region
            });

        if (error) {
            console.error('Error recording click:', error);
        }

        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
        console.error('Failed to record click:', err);
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Update getSocialIcon to accept a size parameter
  const getSocialIcon = (url: string, size: number = 25) => {
  if (typeof url !== 'string') return <Globe size={size} className="text-orange-300" />;
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      if (domain.includes('clinkr.live')) {
  return <img src={logo} alt="Clinkr" className={`w-[${size}px] h-[${size}px] rounded-full bg-white border border-orange-200`} style={{objectFit:'contain', background:'bg-gradient-to-r from-orange-100 to-amber-100 opacity-20 blur-3xl -z-10', width: size, height: size}} />;
      }
      // Try to fetch favicon/logo for all other domains
      return (
        <img
          src={`https://logo.clearbit.com/${domain}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
          }}
          alt={`${domain} icon`}
          style={{ width: size, height: size, borderRadius: '50%', background: '#fff', objectFit: 'contain', border: '1px solid #ffebe1' }}
        />
      );
    } catch {
  return <Globe size={size} className="text-orange-300" />;
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
    <div className="min-h-screen relative overflow-hidden font-inter"
         style={{
           background: 'radial-gradient(circle at 20% 20%, rgba(255, 122, 26, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 181, 107, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 90%, rgba(255, 154, 62, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 10%, rgba(255, 193, 80, 0.4) 0%, transparent 50%), linear-gradient(135deg, #FFF8F0 0%, #FFFBF5 100%)',
         }}>
      
      {/* Funky Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-6 h-6 rounded-full opacity-30 ${
              i % 4 === 0 ? 'bg-orange-400' : 
              i % 4 === 1 ? 'bg-amber-400' : 
              i % 4 === 2 ? 'bg-orange-300' : 'bg-amber-300'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              scale: [1, 1.3, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-orange-400/20 to-amber-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-4 relative z-10">
        {/* Funky Header */}
        <motion.div 
          className="flex justify-center items-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 1 
          }}
        >
          <Link to="/homepage" className="flex items-center gap-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.img 
                src={logo} 
                alt="Clinkr Logo" 
                className="w-12 h-12 drop-shadow-2xl"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -inset-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-30 blur-lg"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </motion.div>
            
            <motion.h1 
              className="text-3xl md:text-5xl font-black relative"
              whileHover={{ scale: 1.05 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 drop-shadow-lg">
                Clinkr
              </span>
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-lg opacity-20 blur-xl"
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />
              {/* Sparkle effects */}
              <motion.div className="absolute -top-2 -right-2">
                <FaHandSparkles className="text-orange-400 text-2xl" />
              </motion.div>
              <motion.div 
                className="absolute -bottom-2 -left-2"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              >
                <FaRocket className="text-orange-400 text-xl" />
              </motion.div>
            </motion.h1>
          </Link>
        </motion.div>
  
        {/* Funky Profile Content */}
        <motion.div 
          className="relative max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Main Profile Card with Neon Effect */}
          <motion.div
            className="relative bg-gradient-to-br from-white/90 via-white/70 to-white/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 50px rgba(255, 122, 26, 0.3), 0 0 100px rgba(255, 122, 26, 0.2)"
            }}
            style={{ 
              boxShadow: "0 0 30px rgba(255, 122, 26, 0.2), 0 0 60px rgba(255, 122, 26, 0.1)"
            }}
          >
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 rounded-3xl opacity-30 blur-sm"
              animate={{
                background: [
                  "linear-gradient(to right, #fb923c, #f59e0b, #fb923c)",
                  "linear-gradient(to right, #f59e0b, #fb923c, #f59e0b)",
                  "linear-gradient(to right, #fb923c, #f59e0b, #fb923c)"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Corner decorations */}
            <motion.div className="absolute top-4 right-4 text-3xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity }}>
              ✨
            </motion.div>
            <motion.div className="absolute bottom-4 left-4 text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}>
              🚀
            </motion.div>
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400"
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
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-bl-full" />
          </motion.div>
          
          <div className="text-center relative z-10">
            {/* Profile Picture Section */}
            <motion.div 
              className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-orange-400 via-amber-300 to-orange-200 p-1 flex items-center justify-center overflow-visible mb-6 relative shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(79, 70, 229, 0.4)' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400 via-amber-300 to-orange-200 opacity-50 blur-md"></div>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative z-10">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                    <motion.div 
                      className="rounded-full h-10 w-10 border-b-2 border-t-2 border-orange-400"
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
                    className="bg-gradient-to-r from-orange-100 to-amber-100 w-full h-full flex items-center justify-center"
                  >
                    <FaUser size={64} className="text-orange-500" />
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
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-300 to-amber-300 rounded-full" 
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
              className="mt-10 space-y-3 max-w-2xl mx-auto"
              initial="hidden"
              animate="visible"
              style={{ overflow: 'visible', position: 'relative' }}
            >
              <AnimatePresence>
                {links.map((link, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    style={{ 
                      overflow: 'visible', 
                      zIndex: activeLinkMenu === index ? 1000 : 1,
                      position: 'relative'
                    }}
                    className={activeLinkMenu === index ? 'relative' : ''}
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 rounded-xl border border-white/40 bg-white/90 backdrop-blur-lg" style={{ overflow: 'visible', position: 'relative' }}>
                      <CardContent className="flex items-center justify-between gap-3 md:gap-4 p-3 py-2.5 relative" style={{ overflow: 'visible' }}>
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-transparent to-purple-50/40 opacity-70" />
                        
                        {/* Link content */}
                        <div className="flex items-center gap-3 flex-grow min-w-0 relative z-10">
                          <motion.div 
                            className="flex-shrink-0 w-9 h-9 rounded-full bg-white shadow-sm border border-indigo-100 flex items-center justify-center overflow-visible"
                            whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {getSocialIcon(link.url, 28)}
                          </motion.div>
                          <div className="flex flex-col items-start flex-grow min-w-0">
                            <span className="text-base font-medium bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 bg-clip-text text-transparent truncate group-hover:from-purple-600 group-hover:via-indigo-600 group-hover:to-blue-600 transition-all duration-300 leading-tight">{link.title}</span>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-500 hover:text-indigo-600 transition-colors block leading-tight"
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
                                  {link.url.length > 25 ? link.url.slice(0, 22) + '...' : link.url}
                                </span>
                                <span className="hidden md:block">
                                  {link.url.length > 45 ? link.url.slice(0, 42) + '...' : link.url}
                                </span>
                              </motion.span>
                            </a>
                          </div>
                        </div>
                        <div 
                          className="relative flex-shrink-0 dropdown-container" 
                          ref={(el) => {
                            linkMenuRefs.current[index] = el;
                          }}
                          style={{ zIndex: activeLinkMenu === index ? 1001 : 10, position: 'relative' }}
                        >
                          <motion.button
                            className="p-1.5 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:via-amber-100 hover:to-orange-200 focus:outline-none transition-colors"
                            aria-label="Link actions"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveLinkMenu(activeLinkMenu === index ? null : index);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4 text-orange-400" />
                          </motion.button>
                          
                          <AnimatePresence>
                            {activeLinkMenu === index && (
                              <motion.div 
                                className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-orange-100 py-2 min-w-40 dropdown-menu"
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                style={{ 
                                  zIndex: 10000,
                                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                  position: 'absolute'
                                }}
                              >
                                <motion.button
                                  className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center gap-3 text-sm"
                                  onClick={(e) => { handleLinkClick(link.url, index, e); setActiveLinkMenu(null); }}
                                  whileHover={{ x: 2 }}
                                >
                                  <Globe size={14} className="text-orange-400" />
                                  <span>Visit this link</span>
                                </motion.button>
                                <motion.button
                                  className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center gap-3 text-sm"
                                  onClick={() => { 
                                    navigator.clipboard.writeText(link.url); 
                                    setActiveLinkMenu(null);
                                    // Show toast notification here if you want
                                  }}
                                  whileHover={{ x: 2 }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                  <span>Copy to clipboard</span>
                                </motion.button>
                                <motion.button
                                  className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 flex items-center gap-3 text-sm mt-1"
                                  onClick={() => setActiveLinkMenu(null)}
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
        </motion.div>

        {/* Footer Section */}
        <motion.footer
          className="mt-8 py-8 text-center text-orange-900 text-sm flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="mt-4 flex flex-col sm:flex-row justify-center sm:gap-5 items-center w-full max-w-2xl mx-auto">
            <a
              href="/homepage"
              className="text-orange-700 hover:text-orange-500 hover:underline underline-offset-4 transition-colors font-medium"
            >
              Visit Clinkr
            </a>
            <a
              href="/getstarted"
              className="text-orange-700 hover:text-orange-500 hover:underline underline-offset-4 transition-colors font-medium"
            >
              Get Started Now
            </a>
          </div>

          <p className="mt-6 text-orange-600">&copy; {new Date().getFullYear()} Clinkr. All rights reserved.</p>
        </motion.footer>
      </div>
    </div>
  );
};


export default PublicProfile;