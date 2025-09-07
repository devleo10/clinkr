import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../ui/card";
import logo from "../../assets/Frame.png";
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { FaUser, FaRocket, FaHandSparkles } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../ui/loadingScreen';
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

        {/* Header */}
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
            <img src={logo} alt="Clinkr Logo" className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Clinkr</h1>
          </Link>
        </motion.div>

        {/* Profile Content */}
        <motion.div 
          className="relative max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Main Profile Card (clean) */}
          <div className="relative bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <div className="text-center relative z-10">
              {/* Profile Picture Section */}
              <div className="w-36 h-36 mx-auto rounded-full p-1 flex items-center justify-center mb-6 relative shadow-sm border border-gray-100 bg-white">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                  {profile?.profile_picture ? (
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
                </div>
              </div>

              <div className="text-center mt-4">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  {loading ? 'Loading...' : (profile?.username || 'Profile not found')}
                </h1>
              </div>
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
      
      {/* Subtle neutral background for cleaner look */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-orange-50 opacity-60" />
      </div>
      
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
            <img src={logo} alt="Clinkr Logo" className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Clinkr</h1>
          </Link>
          </Link>
        </motion.div>
  
        {/* Funky Profile Content */}
          <motion.div 
            className="relative max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Main Profile Card (clean) */}
            <div className="relative bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="text-center relative z-10">
            {/* Profile Picture Section */}
            <motion.div 
              className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-orange-400 via-amber-300 to-orange-200 p-1 flex items-center justify-center overflow-visible mb-6 relative shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(79, 70, 229, 0.4)' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              <div className="w-36 h-36 mx-auto rounded-full p-1 flex items-center justify-center mb-6 relative shadow-sm border border-gray-100 bg-white">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
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
        
              <div className="text-center mt-4">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  {loading ? 'Loading...' : (profile?.username || 'Profile not found')}
                </h1>
              </div>
      
              <div className="text-center max-w-lg mx-auto mt-3">
                <p className="text-gray-600 leading-relaxed">{loading ? 'Loading...' : (profile?.bio || 'Bio not available')}</p>
              </div>
      
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
                            <Card className="hover:shadow transition-all duration-200 rounded-xl border border-gray-100 bg-white" style={{ overflow: 'visible', position: 'relative' }}>
                            <CardContent className="flex items-center justify-between gap-3 md:gap-4 p-3 py-2.5 relative" style={{ overflow: 'visible' }}>
                              <div className="flex items-center gap-3 flex-grow min-w-0 relative z-10">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-50 shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                                  {getSocialIcon(link.url, 28)}
                                </div>
                                <div className="flex flex-col items-start flex-grow min-w-0">
                                  <span className="text-base font-medium text-gray-900 truncate leading-tight">{link.title}</span>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors block leading-tight truncate"
                                    style={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block',
                                      maxWidth: '100%'
                                    }}
                                    onClick={(e) => handleLinkClick(link.url, index, e)}
                                  >
                                    <span className="inline-block">
                                      {link.url.length > 45 ? link.url.slice(0, 42) + '...' : link.url}
                                    </span>
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
                          <button
                            className="p-1.5 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
                            aria-label="Link actions"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveLinkMenu(activeLinkMenu === index ? null : index);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </button>
                          
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