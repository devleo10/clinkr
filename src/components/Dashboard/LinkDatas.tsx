import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

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
          const url = links[i];
          // Only add if url is a string
          if (typeof url === 'string') {
            userLinks.push({
              title: titles[i] || url,
              url: url,
              clicks: clickCounts.get(url) || 0
            });
          }
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

  const LinkWithIcon = ({ url }: { url: string }) => {
    let domain = "";
    try {
      domain = new URL(url).hostname;
    } catch {
      domain = url;
    }

    // Responsive trim length
    const getTrimmedUrl = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) return url.length > 28 ? url.slice(0, 25) + '...' : url; // mobile
        if (width < 1024) return url.length > 40 ? url.slice(0, 37) + '...' : url; // tablet
        return url.length > 60 ? url.slice(0, 57) + '...' : url; // desktop
      }
      return url;
    };

    return (
      <div className="flex items-center gap-2">
        <img
          src={`https://logo.clearbit.com/${domain}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
          }}
          alt={`${domain} icon`}
          className="w-6 h-6 rounded"
        />
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="hover:underline text-blue-600 truncate max-w-[180px] sm:max-w-[320px] lg:max-w-[480px] inline-block align-middle"
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}
        >
          {getTrimmedUrl()}
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-auto min-h-20 mb-10 md:mb-20 glass-card bg-white/80 backdrop-blur-lg border border-white/30 px-10 py-6 md:py-8 flex flex-col justify-center items-center space-y-4 rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        <p className="text-indigo-600 text-lg font-medium">Loading your links, please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-auto min-h-20 mb-10 md:mb-20 glass-card bg-white/80 backdrop-blur-lg border border-white/30 px-10 py-6 md:py-8 flex justify-center items-center rounded-xl shadow-lg">
        <p className="text-red-500">Error loading links: {error}</p>
      </div>
    );
  }

  return (
    <div className='w-full h-auto min-h-20 mb-10 md:mb-20 glass-card bg-white/80 backdrop-blur-lg border border-white/30 px-4 sm:px-6 lg:px-8 py-6 rounded-xl shadow-lg relative overflow-hidden'>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70" />
      
      {/* Animated accent */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      
      {filteredLinks.length === 0 ? (
        <div className="text-center py-8 relative z-10">
          <p className="text-gray-500">No links found. Add your first link to get started!</p>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Desktop Table */}
          <table className="hidden sm:table w-full bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <tr>
                <th className="py-3 px-4 border-b border-indigo-100 text-left font-medium text-gray-700">Title</th>
                <th className="py-3 px-4 border-b border-indigo-100 text-left font-medium text-gray-700">URL</th>
                <th className="py-3 px-4 border-b border-indigo-100 text-center font-medium text-gray-700">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100 border-spacing-y-2">
              {filteredLinks.map((link, index) => (
                <tr key={index} className="hover:bg-indigo-50/50 transition-colors my-2">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-800">{link.title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <LinkWithIcon url={link.url} />
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-indigo-600">{link.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {filteredLinks.map((link, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 flex flex-col space-y-2 border border-indigo-50">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-gray-800 text-lg">{link.title}</span>
                </div>
                <LinkWithIcon url={link.url} />
                <div className="text-right text-indigo-600 text-sm">
                  Clicks: <span className="font-bold">{link.clicks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkDatas;
