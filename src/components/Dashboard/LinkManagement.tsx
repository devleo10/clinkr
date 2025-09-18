import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLink, FaCopy, FaTrash, FaExternalLinkAlt, FaChartLine, FaQrcode, 
  FaEdit, FaCheck, FaTimes, FaSpinner, FaTag,
  FaEye, FaEyeSlash, FaLock, FaPlus
} from 'react-icons/fa';
import { linkShorteningService, ShortLink } from '../../lib/linkShorteningService';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import CreateLinkModal from './CreateLinkModal';

interface EnhancedLink extends ShortLink {
  description?: string;
  tags?: string[];
  password?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface LinkManagementProps {
  userId: string;
  onLinkUpdate?: (links: EnhancedLink[]) => void;
}

const LinkManagement: React.FC<LinkManagementProps> = ({ userId, onLinkUpdate }) => {
  const { simplifiedAnimations } = usePerformanceOptimization();
  const [links, setLinks] = useState<EnhancedLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLinks, setFetchingLinks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editData, setEditData] = useState({
    url: '',
    title: '',
    description: '',
    tags: [] as string[],
    password: '',
    expiresAt: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  });

  // Fetch user's links
  useEffect(() => {
    const fetchLinks = async () => {
      if (!userId) return;

      try {
        setFetchingLinks(true);
        const userLinks = await linkShorteningService.getUserShortLinks(userId);
        setLinks(userLinks as EnhancedLink[]);
        onLinkUpdate?.(userLinks as EnhancedLink[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetchingLinks(false);
      }
    };

    fetchLinks();
  }, [userId, onLinkUpdate]);

  // Handle new link creation from modal
  const handleLinkCreated = (newLink: EnhancedLink) => {
    setLinks(prev => [newLink, ...prev]);
    onLinkUpdate?.([newLink, ...links]);
    setSuccessMessage('Link created successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCopyLink = async (shortCode: string) => {
    try {
      await navigator.clipboard.writeText(linkShorteningService.getShortLinkUrl(shortCode));
      setSuccessMessage('Short link copied to clipboard!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError('Failed to copy link to clipboard');
    }
  };

  const handleDeleteLink = async (shortCode: string) => {
    try {
      await linkShorteningService.deleteShortLink(shortCode, userId);
      setLinks(prev => prev.filter(link => link.short_code !== shortCode));
      onLinkUpdate?.(links.filter(link => link.short_code !== shortCode));
      setSuccessMessage('Link deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (link: EnhancedLink) => {
    setEditingLink(link.short_code);
    setEditData({
      url: link.original_url,
      title: link.title || '',
      description: link.description || '',
      tags: link.tags || [],
      password: link.password || '',
      expiresAt: link.expires_at ? new Date(link.expires_at).toISOString().split('T')[0] : '',
      utm_source: link.utm_source || '',
      utm_medium: link.utm_medium || '',
      utm_campaign: link.utm_campaign || '',
    });
  };

  const cancelEdit = () => {
    setEditingLink(null);
    setEditData({
      url: '',
      title: '',
      description: '',
      tags: [],
      password: '',
      expiresAt: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
    });
  };

  const handleEditLink = async (shortCode: string) => {
    try {
      await linkShorteningService.updateShortLink(shortCode, userId, {
        originalUrl: editData.url,
        title: editData.title,
        expiresAt: editData.expiresAt ? new Date(editData.expiresAt) : undefined,
      });

      setLinks(prev => prev.map(link => 
        link.short_code === shortCode 
          ? { 
              ...link, 
              original_url: editData.url,
              title: editData.title,
              expires_at: editData.expiresAt || undefined,
              description: editData.description,
              tags: editData.tags,
              password: editData.password,
              utm_source: editData.utm_source,
              utm_medium: editData.utm_medium,
              utm_campaign: editData.utm_campaign,
            }
          : link
      ));

      setEditingLink(null);
      setSuccessMessage('Link updated successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };


  if (fetchingLinks) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
          >
            {successMessage}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create New Link Button */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Link Management</h3>
            <p className="text-sm text-gray-600">Create and manage your shortened links</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 text-white rounded-lg hover:from-orange-500 hover:via-amber-500 hover:to-orange-500 transition-all duration-300 font-medium"
          >
            <FaPlus size={16} />
            Create New Link
          </button>
        </div>
      </div>

      {/* Links List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Links</h3>
          <span className="text-sm text-gray-500">{links.length} links</span>
        </div>
        
        {links.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <FaLink className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
            <p className="text-gray-500">Create your first link above to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: simplifiedAnimations ? 0 : index * 0.1,
                  ease: "easeOut"
                }}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                {editingLink === link.short_code ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                        <input
                          type="url"
                          value={editData.url}
                          onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditLink(link.short_code)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FaLink className="text-orange-400 flex-shrink-0" size={16} />
                        <span className="font-semibold text-gray-900 truncate">{link.title}</span>
                        {link.password && <FaLock className="text-gray-400" size={12} />}
                        {link.expires_at && new Date(link.expires_at) < new Date() && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Expired</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">{link.original_url}</p>
                      <p className="text-xs text-orange-400 font-mono bg-orange-50 px-2 py-1 rounded inline-block">
                        {linkShorteningService.getShortLinkUrl(link.short_code)}
                      </p>
                      {link.description && (
                        <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                      )}
                      {link.tags && link.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {link.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                            >
                              <FaTag size={8} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaChartLine size={12} />
                          {link.clicks} clicks
                        </span>
                        <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                        {link.expires_at && (
                          <span>Expires {new Date(link.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => handleCopyLink(link.short_code)}
                        className="p-2 text-gray-600 hover:text-orange-400 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Copy short link"
                      >
                        <FaCopy size={16} />
                      </button>
                      <a
                        href={link.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-orange-400 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Open original URL"
                      >
                        <FaExternalLinkAlt size={16} />
                      </a>
                      <a
                        href={linkShorteningService.getQRCodeUrl(link.short_code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-orange-400 hover:bg-orange-50 rounded-lg transition-colors"
                        title="View QR Code"
                      >
                        <FaQrcode size={16} />
                      </a>
                      <button
                        onClick={() => startEdit(link)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit link"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.short_code)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete link"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Link Modal */}
      <CreateLinkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userId={userId}
        onLinkCreated={handleLinkCreated}
      />
    </div>
  );
};

export default LinkManagement;
