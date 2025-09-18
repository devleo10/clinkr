import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLink, FaCopy, FaTimes, FaSpinner, FaTag,
  FaEye, FaEyeSlash, FaLock, FaCheck, FaPlus
} from 'react-icons/fa';
import { linkShorteningService, ShortLink } from '../../lib/linkShorteningService';

interface EnhancedLink extends ShortLink {
  description?: string;
  tags?: string[];
  password?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onLinkCreated: (link: EnhancedLink) => void;
}

const CreateLinkModal: React.FC<CreateLinkModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  onLinkCreated 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  const [slugAvailability, setSlugAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({
    checking: false,
    available: null,
    error: null,
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
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
      setError(null);
      setSuccessMessage(null);
      setShowAdvanced(false);
    }
  }, [isOpen]);

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

      onLinkCreated(enhancedLink);
      
      setSuccessMessage('Link created successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onKeyDown={handleKeyPress}
            tabIndex={-1}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg">
                    <FaPlus className="text-white" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Create New Link</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
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

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Title *
                      <span className="text-xs text-gray-500 ml-1">(What people will see)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 'My Portfolio', 'Black Friday Sale'"
                      value={newLink.title}
                      onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original URL *
                      <span className="text-xs text-gray-500 ml-1">(The long link to shorten)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://your-website.com/very-long-url"
                      value={newLink.url}
                      onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Custom Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Short Code
                    <span className="text-xs text-gray-500 ml-1">(Optional - make it memorable)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g., 'my-portfolio', 'sale-2024'"
                      value={newLink.customCode}
                      onChange={(e) => setNewLink(prev => ({ ...prev, customCode: e.target.value }))}
                      className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors ${
                        slugAvailability.available === true
                          ? 'border-green-300 bg-green-50'
                          : slugAvailability.available === false
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
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
                    <p className="text-green-600 text-sm mt-1">✓ This short code is available!</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Instead of random letters, use something meaningful like 'my-portfolio'</p>
                </div>

                {/* Advanced Options Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Need more control?</h4>
                    <p className="text-xs text-gray-500">Add expiration, password protection, and tracking</p>
                  </div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors text-sm font-medium"
                  >
                    {showAdvanced ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    {showAdvanced ? 'Hide' : 'Show'} Options
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📝 Description
                          <span className="text-xs text-gray-500 ml-1">(Optional - for your own notes)</span>
                        </label>
                        <textarea
                          placeholder="e.g., 'Black Friday sale link' or 'Social media bio'"
                          value={newLink.description}
                          onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition-colors"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">This helps you remember what this link is for</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ⏰ Expiration Date
                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                          </label>
                          <input
                            type="date"
                            value={newLink.expiresAt}
                            onChange={(e) => setNewLink(prev => ({ ...prev, expiresAt: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                          />
                          <p className="text-xs text-gray-500 mt-1">Link stops working after this date</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🔒 Password Protection
                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                          </label>
                          <input
                            type="password"
                            placeholder="Enter password to protect link"
                            value={newLink.password}
                            onChange={(e) => setNewLink(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                          />
                          <p className="text-xs text-gray-500 mt-1">People need this password to access the link</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🏷️ Tags
                          <span className="text-xs text-gray-500 ml-1">(Optional - organize your links)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newLink.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm"
                            >
                              <FaTag size={10} />
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 text-orange-500 hover:text-orange-700"
                              >
                                <FaTimes size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Type a tag and press Enter (e.g., 'sale', 'social-media')"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tags help you organize and find your links later</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📊 Campaign Tracking
                          <span className="text-xs text-gray-500 ml-1">(Optional - for marketers)</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Track which campaigns bring the most visitors</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Where did they come from?</label>
                            <input
                              type="text"
                              placeholder="facebook, google, email"
                              value={newLink.utm_source}
                              onChange={(e) => setNewLink(prev => ({ ...prev, utm_source: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">What type of campaign?</label>
                            <input
                              type="text"
                              placeholder="social, email, ads"
                              value={newLink.utm_medium}
                              onChange={(e) => setNewLink(prev => ({ ...prev, utm_medium: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Campaign name</label>
                            <input
                              type="text"
                              placeholder="summer-sale, newsletter"
                              value={newLink.utm_campaign}
                              onChange={(e) => setNewLink(prev => ({ ...prev, utm_campaign: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Example: facebook → social → black-friday-sale</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLink}
                  disabled={loading || !newLink.url || !newLink.title || (newLink.customCode && slugAvailability.available === false)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 text-white rounded-lg hover:from-orange-500 hover:via-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  {loading ? 'Creating...' : 'Create Link'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateLinkModal;
