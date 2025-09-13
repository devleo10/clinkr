import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLink, FaCopy, FaTrash, FaExternalLinkAlt, FaChartLine, FaQrcode, FaEdit, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { linkShorteningService, ShortLink } from '../../lib/linkShorteningService';
import { useAuth } from '../auth/AuthProvider';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';

const LinkShortening = () => {
  const { session } = useAuth();
  const { simplifiedAnimations } = usePerformanceOptimization();
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLinks, setFetchingLinks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({
    url: '',
    title: '',
    customCode: '',
  });
  const [editData, setEditData] = useState({
    url: '',
    title: '',
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

  // Fetch user's short links on component mount
  useEffect(() => {
    const fetchShortLinks = async () => {
      if (!session?.user?.id) return;

      try {
        setFetchingLinks(true);
        const links = await linkShorteningService.getUserShortLinks(session.user.id);
        setShortLinks(links);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetchingLinks(false);
      }
    };

    fetchShortLinks();
  }, [session?.user?.id]);

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

  const handleCreateShortLink = async () => {
    if (!session?.user?.id || !newLink.url) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const shortLink = await linkShorteningService.createShortLink({
        originalUrl: newLink.url,
        title: newLink.title || undefined,
        customCode: newLink.customCode || undefined,
      }, session.user.id);

      setShortLinks(prev => [shortLink, ...prev]);
      setNewLink({ url: '', title: '', customCode: '' });
      setSuccessMessage('Short link created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShortLink = async (shortCode: string) => {
    try {
      await navigator.clipboard.writeText(linkShorteningService.getShortLinkUrl(shortCode));
      setSuccessMessage('Short link copied to clipboard!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError('Failed to copy link to clipboard');
    }
  };

  const handleDeleteShortLink = async (shortCode: string) => {
    if (!session?.user?.id) return;

    try {
      await linkShorteningService.deleteShortLink(shortCode, session.user.id);
      setShortLinks(prev => prev.filter(link => link.short_code !== shortCode));
      setSuccessMessage('Short link deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditShortLink = async (shortCode: string) => {
    if (!session?.user?.id) return;

    try {
      await linkShorteningService.updateShortLink(shortCode, session.user.id, editData);
      
      // Update local state
      setShortLinks(prev => prev.map(link => 
        link.short_code === shortCode 
          ? { ...link, original_url: editData.url, title: editData.title }
          : link
      ));
      
      setEditingLink(null);
      setEditData({ url: '', title: '' });
      setSuccessMessage('Short link updated successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (link: ShortLink) => {
    setEditingLink(link.short_code);
    setEditData({
      url: link.original_url,
      title: link.title || '',
    });
  };

  const cancelEdit = () => {
    setEditingLink(null);
    setEditData({ url: '', title: '' });
  };

  if (fetchingLinks) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#ED7B00' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(237, 123, 0, 0.1)' }}>
          <FaLink style={{ color: '#ED7B00' }} size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Link Shortening</h2>
          <p className="text-gray-600 text-sm">Create and manage your short links</p>
        </div>
      </div>
      
      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
          >
            {successMessage}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Create New Short Link */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Short Link</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL to Shorten</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={newLink.url}
              onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent"
              style={{ '--focus-ring': 'rgba(237, 123, 0, 0.3)' } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Title</label>
            <input
              type="text"
              placeholder="My Awesome Link"
              value={newLink.title}
              onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent"
              style={{ '--focus-ring': 'rgba(237, 123, 0, 0.3)' } as React.CSSProperties}
            />
          </div>
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
            <p className="text-gray-500 text-xs mt-1">
              Use letters, numbers, and hyphens. 3-50 characters.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateShortLink}
          disabled={loading || !newLink.url || (newLink.customCode && slugAvailability.available === false) || false}
          className="px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          style={{ backgroundColor: '#ED7B00', '--hover-bg': '#E66426' } as React.CSSProperties}
        >
          {loading ? 'Creating...' : 'Create Short Link'}
        </button>
      </div>

      {/* Short Links List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Short Links</h3>
          <span className="text-sm text-gray-500">{shortLinks.length} links</span>
        </div>
        
        {shortLinks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <FaLink className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No short links yet</h3>
            <p className="text-gray-500">Create your first short link above to get started!</p>
          </div>
        ) : (
          shortLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: simplifiedAnimations ? 0 : index * 0.1,
                ease: "easeOut"
              }}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              {editingLink === link.short_code ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                      <input
                        type="url"
                        value={editData.url}
                        onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditShortLink(link.short_code)}
                      className="px-4 py-2 text-white rounded-lg transition-colors text-sm"
                      style={{ backgroundColor: '#ED7B00', '--hover-bg': '#E66426' } as React.CSSProperties}
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
                      <FaLink style={{ color: '#ED7B00' }} className="flex-shrink-0" size={16} />
                      <span className="font-semibold text-gray-900 truncate">{link.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{link.original_url}</p>
                    <p className="text-xs font-mono px-2 py-1 rounded inline-block" style={{ color: '#ED7B00', backgroundColor: 'rgba(237, 123, 0, 0.1)' }}>
                      {linkShorteningService.getShortLinkUrl(link.short_code)}
                    </p>
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
                      onClick={() => handleCopyShortLink(link.short_code)}
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
                      onClick={() => handleDeleteShortLink(link.short_code)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete short link"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default LinkShortening;
