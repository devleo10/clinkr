import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import logo from "../../assets/Frame.png";
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../ui/loadingScreen';
import { MoreHorizontal } from 'lucide-react';
import { getSocialIcon, detectDeviceType, detectBrowser } from '../../lib/profile-utils';

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
        
        if (error) throw error;
        
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
        setError(err?.message || 'Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (username) fetchProfile();
  }, [username]);

  const links = Array.isArray(profile?.links) ? profile.links.map((url, index) => ({
    title: profile?.link_title && profile.link_title[index] ? profile.link_title[index] : url,
    url,
  })) : [];

  const handleLinkClick = async (url: string, index: number, e: React.MouseEvent) => {
    try {
      e.preventDefault();
      
      if (!profile || !profile.id) { 
        window.open(url, '_blank'); 
        return; 
      }
      
      const deviceType = detectDeviceType();
      const browser = detectBrowser();
      let lat: number | null = null;
      let lng: number | null = null;
      
      try {
        const resp = await fetch('https://ipapi.co/json/');
        const data = await resp.json();
        lat = data.latitude; 
        lng = data.longitude;
      } catch {
        // Ignore geolocation errors
      }
      
      await supabase.from('link_analytics').insert({ 
        profile_id: profile.id, 
        user_id: profile.id, 
        link_url: url, 
        link_index: index, 
        device_type: deviceType, 
        browser, 
        event_type: 'click', 
        lat, 
        lng 
      });
      
      window.open(url, '_blank');
    } catch (err) {
      console.error('click analytics error', err);
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600">{error || 'The requested profile does not exist.'}</p>
          <Link to="/homepage" className="mt-4 inline-block text-orange-600 hover:text-orange-700">
            Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center mb-8">
          <Link to="/homepage" className="flex items-center gap-4">
            <img src={logo} alt="Clinkr Logo" className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Clinkr</h1>
          </Link>
        </div>

        <div className="relative bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="text-center">
            <div className="w-36 h-36 mx-auto rounded-full overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
              {profile?.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
                  alt={profile.username} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <FaUser size={64} className="text-orange-400" />
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">@{profile.username}</h2>
            <p className="text-gray-600 mt-2">{profile.bio || 'No bio available'}</p>
          </div>

          <div className="mt-6 space-y-3">
            <AnimatePresence>
              {links.map((link, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div 
                        className="flex items-center gap-3 flex-1"
                        onClick={(e) => handleLinkClick(link.url, i, e)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                          {getSocialIcon(link.url, 28)}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium text-gray-900 truncate">{link.title}</span>
                          <span className="text-xs text-gray-500 truncate">{link.url}</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLinkMenu(activeLinkMenu === i ? null : i);
                          }}
                          className="p-1.5 rounded-full hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </button>
                        
                        {activeLinkMenu === i && (
                          <div className="absolute right-0 top-10 bg-white border rounded shadow-lg p-2 z-10">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation();
                                navigator.clipboard.writeText(link.url); 
                                setActiveLinkMenu(null); 
                              }} 
                              className="text-sm hover:bg-gray-100 px-2 py-1 rounded w-full text-left"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {links.length === 0 && (
            <div className="text-center mt-8 text-gray-500">
              <p>No links available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
