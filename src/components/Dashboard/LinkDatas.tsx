import React, { useEffect, useState } from 'react';
import { FaLink, FaTwitter, FaYoutube, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaGlobe, FaPinterest, FaReddit, FaSnapchat, FaWhatsapp, FaTelegram, FaDiscord, FaSpotify, FaTwitch } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { SocialIcon } from 'react-social-icons';

interface Link {
  title: string;
  url: string;
  clicks: number;
}



interface LinkDatasProps {
  searchQuery: string;
}

const LinkDatas: React.FC<LinkDatasProps> = ({ searchQuery }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileLinks();
  }, []);

  const fetchProfileLinks = async () => {
    try {
      setLoading(true);
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Get the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('links, link_title')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get click analytics for all links
      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_link_clicks', { user_id_param: user.id });

      if (analyticsError) throw analyticsError;

      // Create a map of URL to click count
      const clickCounts = new Map();
      if (analyticsData) {
        analyticsData.forEach((item: any) => {
          clickCounts.set(item.link_url, parseInt(item.click_count));
        });
      }

      // Transform the data into the Link format
      const userLinks: Link[] = [];
      
      if (profileData && profileData.links && profileData.link_title) {
        const links = Array.isArray(profileData.links) 
          ? profileData.links 
          : (profileData.links ? JSON.parse(profileData.links) : []);
          
        const titles = Array.isArray(profileData.link_title) 
          ? profileData.link_title 
          : (profileData.link_title ? JSON.parse(profileData.link_title) : []);
        
        // Create Link objects from the data
        for (let i = 0; i < links.length; i++) {
          userLinks.push({
            title: titles[i] || links[i],
            url: links[i],
            clicks: clickCounts.get(links[i]) || 0
          });
        }
      }
      
      setLinks(userLinks);
    } catch (err: any) {
      console.error('Error fetching links:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-auto min-h-20 mb-10 md:mb-20 bg-[#F9FAFB] px-10 py-6 md:py-0 flex flex-col justify-center items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="text-gray-700 text-lg font-medium">Loading your links, please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-auto min-h-20 mb-10 md:mb-20 bg-[#F9FAFB] px-10 py-6 md:py-0 flex justify-center items-center">
        <p className="text-red-500">Error loading links: {error}</p>
      </div>
    );
  }

  return (
    <div className='w-full h-auto min-h-20 mb-10 md:mb-20 bg-[#F9FAFB] px-4 sm:px-6 lg:px-8 py-6'>
      {filteredLinks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No links found. Add your first link to get started!</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <table className="hidden sm:table w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 border-b text-left font-medium text-gray-700">Title</th>
                <th className="py-3 px-4 border-b text-left font-medium text-gray-700">Short URL</th>
                <th className="py-3 px-4 border-b text-center font-medium text-gray-700">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-spacing-y-2">
              {filteredLinks.map((link, index) => {
                // Determine which icon to use based on the URL
                let LinkIcon = FaLink;
                let iconColor = "text-blue-500";
                
                if (link.url.includes("twitter.com") || link.url.includes("x.com")) {
                  LinkIcon = FaTwitter;
                  iconColor = "text-[#1DA1F2]";
                } else if (link.url.includes("youtube.com") || link.url.includes("youtu.be")) {
                  LinkIcon = FaYoutube;
                  iconColor = "text-[#FF0000]";
                } else if (link.url.includes("instagram.com")) {
                  LinkIcon = FaInstagram;
                  iconColor = "text-[#E1306C]";
                } else if (link.url.includes("facebook.com") || link.url.includes("fb.com")) {
                  LinkIcon = FaFacebook;
                  iconColor = "text-[#4267B2]";
                } else if (link.url.includes("linkedin.com")) {
                  LinkIcon = FaLinkedin;
                  iconColor = "text-[#0077B5]";
                } else if (link.url.includes("tiktok.com")) {
                  LinkIcon = FaTiktok;
                  iconColor = "text-[#000000]";
                } else if (link.url.includes("pinterest.com")) {
                  LinkIcon = FaPinterest;
                  iconColor = "text-[#E60023]";
                } else if (link.url.includes("reddit.com")) {
                  LinkIcon = FaReddit;
                  iconColor = "text-[#FF4500]";
                } else if (link.url.includes("snapchat.com")) {
                  LinkIcon = FaSnapchat;
                  iconColor = "text-[#FFFC00]";
                } else if (link.url.includes("whatsapp.com")) {
                  LinkIcon = FaWhatsapp;
                  iconColor = "text-[#25D366]";
                } else if (link.url.includes("t.me") || link.url.includes("telegram.org")) {
                  LinkIcon = FaTelegram;
                  iconColor = "text-[#0088cc]";
                } else if (link.url.includes("discord.com") || link.url.includes("discord.gg")) {
                  LinkIcon = FaDiscord;
                  iconColor = "text-[#5865F2]";
                } else if (link.url.includes("spotify.com")) {
                  LinkIcon = FaSpotify;
                  iconColor = "text-[#1DB954]";
                } else if (link.url.includes("twitch.tv")) {
                  LinkIcon = FaTwitch;
                  iconColor = "text-[#9146FF]";
                } else {
                  LinkIcon = FaGlobe;
                  iconColor = "text-blue-500";
                }
                
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors my-2">
                    <td className="py-3 px-4 flex items-center space-x-2">
                      <span className={iconColor}>
                        <LinkIcon />
                      </span>
                      <span className="font-medium">{link.title}</span>
                    </td>
                    <td className="py-3 px-4 text-blue-600">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {link.url}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{link.clicks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-6">
            {filteredLinks.map((link, index) => {
              return (
                <div key={index} className="hover:bg-gray-50 transition-colors my-2">
                  <div className="py-3 px-4 flex items-center space-x-2">
                    <SocialIcon url={link.url} style={{ height: 25, width: 25 }} />
                    <span className="font-medium">{link.title}</span>
                  </div>
                  <div className="py-3 px-4 text-blue-600">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {link.url}
                    </a>
                  </div>
                  <div className="py-3 px-4 text-center font-medium">{link.clicks}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default LinkDatas;
