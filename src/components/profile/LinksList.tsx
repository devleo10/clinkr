import { Reorder, motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { MoreVertical, GripVertical } from 'lucide-react';
import { FaCopy, FaTrash, FaEdit } from 'react-icons/fa';
import { getSocialIcon } from '../../lib/profile-utils';

interface LinkItem {
  title: string;
  url: string;
}

interface LinksListProps {
  links: LinkItem[];
  linkReorderMode: boolean;
  handleReorderLinks: (newOrder: LinkItem[]) => void;
  handleCopyLink: (url: string, title: string) => void;
  handleEditLink: (index: number) => void;
  setLinkToDeleteIndex: (index: number | null) => void;
  activeLinkMenu: number | null;
  setActiveLinkMenu: (index: number | null) => void;
  linkMenuRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

const LinksList = ({
  links,
  linkReorderMode,
  handleReorderLinks,
  handleCopyLink,
  handleEditLink,
  setLinkToDeleteIndex,
  activeLinkMenu,
  setActiveLinkMenu,
  linkMenuRefs
}: LinksListProps) => {
  return (
    <div className="mt-6 space-y-4 max-w-xl mx-auto">
      {linkReorderMode ? (
        <Reorder.Group 
          axis="y" 
          values={links} 
          onReorder={handleReorderLinks}
          className="space-y-4"
        >
          {links.map((link, index) => (
            <Reorder.Item 
              key={link.url + '-' + link.title + '-' + index} 
              value={link}
              className="cursor-move"
            >
              <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl border-2 border-gray-100 bg-white/80 p-1 sm:p-2">
                <CardContent className="flex items-center justify-between gap-2 md:gap-4 p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-grow min-w-0">
                    <GripVertical className="text-gray-400 cursor-move" size={16} />
                    <span className="flex-shrink-0">
                      {getSocialIcon(link.url, window.innerWidth < 640 ? 24 : 36)}
                    </span>
                    <div className="flex flex-col items-start w-full min-w-0">
                      <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate w-full">{link.title}</span>
                      <span className="text-xs sm:text-sm text-gray-500 truncate block w-full">
                        {typeof link.url === 'string' && link.url.length > (window.innerWidth < 640 ? 20 : 38) ? 
                          link.url.slice(0, window.innerWidth < 640 ? 17 : 35) + '...' : link.url}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        links.map((link, index) => (
          <motion.div
            key={link.url + '-' + link.title + '-' + index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: (index * 0.1) + 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl border-2 border-gray-100 bg-white/80 p-1 sm:p-2">
              <CardContent className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-grow min-w-0">
                  <span className="flex-shrink-0">
                    {getSocialIcon(link.url, window.innerWidth < 640 ? 24 : 36)}
                  </span>
                  <div className="flex flex-col items-start w-full min-w-0">
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate w-full">{link.title}</span>
                    <a
                      href={typeof link.url === 'string' ? link.url : ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-gray-500 hover:text-orange-600 transition-colors block truncate w-full"
                    >
                      {typeof link.url === 'string' && link.url.length > (window.innerWidth < 640 ? 20 : 38) ? 
                        link.url.slice(0, window.innerWidth < 640 ? 17 : 35) + '...' : link.url}
                    </a>
                  </div>
                </div>
                {/* Three-dot menu */}
                <div 
                  className="relative flex-shrink-0" 
                  ref={(el) => {
                    linkMenuRefs.current[index] = el;
                  }}
                >
                  <button
                    className="p-1 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                    aria-label="Link options"
                    onClick={() => setActiveLinkMenu(activeLinkMenu === index ? null : index)}
                  >
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </button>
                  {/* Dropdown menu */}
                  {activeLinkMenu === index && (
                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-40 z-50">
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-sm"
                        onClick={() => {
                          handleCopyLink(link.url, link.title);
                          setActiveLinkMenu(null);
                        }}
                      >
                        <FaCopy className="text-blue-500" size={14} />
                        Copy Link
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-indigo-50 flex items-center gap-3 text-sm"
                        onClick={() => {
                          handleEditLink(index);
                          setActiveLinkMenu(null);
                        }}
                      >
                        <FaEdit className="text-indigo-500" size={14} />
                        Edit Link
                      </button>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                        onClick={() => {
                          setLinkToDeleteIndex(index);
                          setActiveLinkMenu(null);
                        }}
                      >
                        <FaTrash className="text-red-500" size={14} />
                        Delete Link
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default LinksList;
