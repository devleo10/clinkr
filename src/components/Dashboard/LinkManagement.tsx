import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLink, FaCopy, FaTrash, FaExternalLinkAlt, FaChartLine, FaQrcode, 
  FaEdit, FaCheck, FaTimes, FaSpinner, FaPlus, FaTag, FaCalendarAlt,
  FaEye, FaEyeSlash, FaLock, FaUnlock
} from 'react-icons/fa';
import { linkShorteningService, ShortLink } from '../../lib/linkShorteningService';
import { useAuth } from '../auth/AuthProvider';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [newLink, setNewLink] = useState({
    url: '',
    title: '',
    customCode: '',
    description: '',
    tags: [] as string[],
    password: '',
    expiresAt: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  });

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

  const [slugAvailability, setSlugAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({
    checking: false,
    available: null,
    error: null,
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

  // Debounced slug availability checking
  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      if (!slug || slug.length < 3) {
        setSlugAvailability({ checking: false, available: null, error: null });
        return;
      }

      setSlugAvailability(prev => ({ ...prev, checking: true, error: null }));

      try {
        const result = await linkShorteningService.checkSlugAvailability(slug);
        setSlugAvailability({
          checking: false,
          available: result.available,
          error: result.error || null,
        });
      } catch (error) {
        setSlugAvailability({
          checking: false,
          available: false,
          error: 'Failed to check availability',
        });
      }
    },
    []
  );

  // Debounce slug checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newLink.customCode) {
        checkSlugAvailability(newLink.customCode);
      } else {
        setSlugAvailability({ checking: false, available: null, error: null });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newLink.customCode, checkSlugAvailability]);

  const handleCreateLink = async () => {
    if (!newLink.url || !newLink.title) {
      setError('Please enter both URL and title.');
      return;
    }
    if (newLink.customCode && slugAvailability.available === false) {
      setError('Please choose a different custom slug.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const linkData = {
        originalUrl: newLink.url,
        title: newLink.title,
        customCode: newLink.customCode || undefined,
        expiresAt: newLink.expiresAt ? new Date(newLink.expiresAt) : undefined,
      };

      const shortLink = await linkShorteningService.createShortLink(linkData, userId);
      
      // Add enhanced properties
      const enhancedLink: EnhancedLink = {
        ...shortLink,
        description: newLink.description,
        tags: newLink.tags,
        password: newLink.password,
        utm_source: newLink.utm_source,
        utm_medium: newLink.utm_medium,
        utm_campaign: newLink.utm_campaign,
      };

      setLinks(prev => [enhancedLink, ...prev]);
      onLinkUpdate?.([enhancedLink, ...links]);
      
      // Reset form
      setNewLink({
        url: '',
        title: '',
        customCode: '',
        description: '',
        tags: [],
        password: '',
        expiresAt: '',
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
      });
      
      setSuccessMessage('Link created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const addTag = (tag: string) => {
    if (tag.trim() && !newLink.tags.includes(tag.trim())) {
      setNewLink(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewLink(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  if (fetchingLinks) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
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

      {/* Create New Link Form */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Link</h3>
        
        <div className="space-y-4">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="My Awesome Link"
                value={newLink.title}
                onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Custom Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Slug (optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="my-awesome-slug"
                value={newLink.customCode}
                onChange={(e) => setNewLink(prev => ({ ...prev, customCode: e.target.value }))}
                className={`w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  slugAvailability.available === true
                    ? 'border-green-300 bg-green-50'
                    : slugAvailability.available === false
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {slugAvailability.checking ? (
                  <FaSpinner className="animate-spin text-gray-400" size={16} />
                ) : slugAvailability.available === true ? (
                  <FaCheck className="text-green-500" size={16} />
                ) : slugAvailability.available === false ? (
                  <FaTimes className="text-red-500" size={16} />
                ) : null}
              </div>
            </div>
            {slugAvailability.error && (
              <p className="text-red-500 text-sm mt-1">{slugAvailability.error}</p>
            )}
            {slugAvailability.available === true && (
              <p className="text-green-600 text-sm mt-1">✓ This slug is available!</p>
            )}
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-500 transition-colors text-sm font-medium"
            >
              {showAdvanced ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>

          {/* Advanced Options */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t border-gray-200 pt-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Optional description for your link"
                    value={newLink.description}
                    onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                    <input
                      type="date"
                      value={newLink.expiresAt}
                      onChange={(e) => setNewLink(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Protection</label>
                    <input
                      type="password"
                      placeholder="Optional password"
                      value={newLink.password}
                      onChange={(e) => setNewLink(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newLink.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs"
                      >
                        <FaTag size={10} />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-orange-600 hover:text-orange-800"
                        >
                          <FaTimes size={8} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UTM Source</label>
                    <input
                      type="text"
                      placeholder="google"
                      value={newLink.utm_source}
                      onChange={(e) => setNewLink(prev => ({ ...prev, utm_source: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UTM Medium</label>
                    <input
                      type="text"
                      placeholder="email"
                      value={newLink.utm_medium}
                      onChange={(e) => setNewLink(prev => ({ ...prev, utm_medium: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UTM Campaign</label>
                    <input
                      type="text"
                      placeholder="summer-sale"
                      value={newLink.utm_campaign}
                      onChange={(e) => setNewLink(prev => ({ ...prev, utm_campaign: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create Button */}
          <button
            onClick={handleCreateLink}
            disabled={loading || !newLink.url || !newLink.title || (newLink.customCode && slugAvailability.available === false)}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:via-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
          >
            {loading ? 'Creating...' : 'Create Link'}
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
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                        <input
                          type="url"
                          value={editData.url}
                          onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        <FaLink className="text-orange-600 flex-shrink-0" size={16} />
                        <span className="font-semibold text-gray-900 truncate">{link.title}</span>
                        {link.password && <FaLock className="text-gray-400" size={12} />}
                        {link.expires_at && new Date(link.expires_at) < new Date() && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Expired</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">{link.original_url}</p>
                      <p className="text-xs text-orange-600 font-mono bg-orange-50 px-2 py-1 rounded inline-block">
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
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Copy short link"
                      >
                        <FaCopy size={16} />
                      </button>
                      <a
                        href={link.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Open original URL"
                      >
                        <FaExternalLinkAlt size={16} />
                      </a>
                      <a
                        href={linkShorteningService.getQRCodeUrl(link.short_code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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
    </div>
  );
};

export default LinkManagement;
