import React from 'react';
import LoadingScreen from '../ui/loadingScreen';
import { useDashboardData } from './DashboardDataContext';

interface LinkDatasProps {
  searchQuery: string;
}

const LinkDatas: React.FC<LinkDatasProps> = ({ searchQuery }) => {
  const { data, isLoading, error } = useDashboardData();

  const links = data?.links || [];
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
          className="hover:underline text-black truncate max-w-[180px] sm:max-w-[320px] lg:max-w-[480px] inline-block align-middle"
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}
        >
          {getTrimmedUrl()}
        </a>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-auto min-h-20 mb-10 md:mb-20 glass-card bg-white/80 backdrop-blur-lg border border-white/30 px-10 py-6 md:py-8 flex flex-col justify-center items-center space-y-4 rounded-xl shadow-lg">
        {/* Use the new standardized compact loader */}
        <LoadingScreen compact />
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
    <div 
      className='w-full h-auto min-h-20 mb-10 md:mb-20 glass-card bg-white/80 backdrop-blur-lg border border-white/30 px-4 sm:px-6 lg:px-8 py-6 rounded-xl shadow-lg relative overflow-hidden'
      style={{ willChange: 'transform' }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50 opacity-70" />
      
      {/* Animated accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500" />
      
      {filteredLinks.length === 0 ? (
        <div className="text-center py-8 relative z-10">
          <p className="text-black">No links found. Add your first link to get started!</p>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Desktop Table */}
          <table className="hidden sm:table w-full bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gradient-to-r from-orange-50 to-orange-50">
              <tr>
                    <th className="py-3 px-4 border-b border-orange-100 text-left font-medium text-black">Title</th>
                    <th className="py-3 px-4 border-b border-orange-100 text-left font-medium text-black">URL</th>
                    <th className="py-3 px-4 border-b border-orange-100 text-center font-medium text-black">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100 border-spacing-y-2">
              {filteredLinks.map((link, index) => (
                <tr key={index} className="hover:bg-orange-50/50 transition-colors my-2">
                  <td className="py-3 px-4">
                        <span className="font-medium text-black">{link.title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <LinkWithIcon url={link.url} />
                  </td>
                      <td className="py-3 px-4 text-center font-medium text-black">{link.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {filteredLinks.map((link, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 flex flex-col space-y-2 border border-orange-50">
                <div className="flex items-center space-x-3">
                    <span className="font-semibold text-black text-lg">{link.title}</span>
                </div>
                <LinkWithIcon url={link.url} />
        <div className="text-right text-black text-sm">
          Clicks: <span className="font-bold text-black">{link.clicks}</span>
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
