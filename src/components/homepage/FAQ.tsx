import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, HelpCircle, Clock, Users, Shield } from 'lucide-react';
import { memo } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      category: "General Questions",
      icon: HelpCircle,
      items: [
        {
          question: "What is Clinkr?",
          answer: "Clinkr is a modern link-in-bio and analytics platform that helps you organize all your important links and track audience engagement in real time. Perfect for creators, entrepreneurs, and professionals who want to showcase their work and understand their audience better.",
          tags: ["platform", "analytics", "links"]
        },
        {
          question: "Is there really a free plan?",
          answer: "Yes! Track unlimited links forever with our free plan. Premium only adds advanced features like geographic data, device analytics, CSV exports, and custom domains. No hidden fees or limitations on the free tier.",
          tags: ["pricing", "free", "features"]
        },
        {
          question: "Is my data private and secure?",
          answer: "Absolutely. We never sell your data, and you control your information. All analytics are anonymized and we use industry-standard encryption. Your privacy is our top priority.",
          tags: ["privacy", "security", "data"]
        },
        {
          question: "How does Clinkr compare to other link-in-bio tools?",
          answer: "Clinkr offers real-time analytics, geographic insights, and a clean, modern interface. Unlike competitors, we focus on privacy-first analytics and don't sell your data. Plus, our free plan includes unlimited links.",
          tags: ["comparison", "features", "analytics"]
        }
      ]
    },
    {
      category: "Setup & Usage",
      icon: Clock,
      items: [
        {
          question: "How do I add links to my bio?",
          answer: "Sign up for free, paste your URL, and we'll generate a custom 'clinkr.live/yourname' page. Share that link in your bio across all platforms! It takes less than 2 minutes to get started.",
          tags: ["setup", "links", "bio"]
        },
        {
          question: "Can I customize how my links look?",
          answer: "Yes! Edit titles, add custom thumbnails, reorder links, and customize your page theme. You can also add custom CSS for advanced styling if you're on Premium.",
          tags: ["customization", "styling", "themes"]
        },
        {
          question: "Can I see which links are most popular?",
          answer: "Yes, your dashboard shows real-time analytics for every link, including clicks, top countries, devices, and peak traffic times. Track performance trends over time.",
          tags: ["analytics", "popular", "dashboard"]
        },
        {
          question: "How do I reset my password?",
          answer: "Go to the login page and click 'Forgot Password' to receive a reset link via email. Check your spam folder if you don't see it within 5 minutes.",
          tags: ["password", "security", "login"]
        },
        {
          question: "Can I use custom domains?",
          answer: "Yes! Premium users can connect their own domain (like yourname.com) instead of using clinkr.live/yourname. This gives you a more professional appearance.",
          tags: ["custom", "domain", "premium"]
        }
      ]
    },
    {
      category: "Premium Features",
      icon: Shield,
      items: [
        {
          question: "What's included in the Premium plan?",
          answer: "Premium includes geo heatmaps, detailed device/browser stats, CSV exports, custom domains, priority support, advanced analytics, and early access to new features. Everything you need to grow your audience.",
          tags: ["premium", "features", "analytics"]
        },
        {
          question: "Can I cancel Premium anytime?",
          answer: "Absolutely. No hidden fees or cancellation penalties—cancel with one click from your dashboard. You'll keep Premium features until the end of your billing period.",
          tags: ["cancel", "billing", "flexible"]
        },
        {
          question: "How do I upgrade to Premium?",
          answer: "Go to your dashboard and click the 'Upgrade' button. You can pay monthly ($9.99) or annually ($99.99 - save 17%). All payments are processed securely through Stripe.",
          tags: ["upgrade", "pricing", "payment"]
        },
        {
          question: "Do you offer refunds?",
          answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with Premium features, contact us within 30 days for a full refund.",
          tags: ["refund", "guarantee", "support"]
        }
      ]
    },
    {
      category: "Analytics & Insights",
      icon: Users,
      items: [
        {
          question: "What analytics data do you track?",
          answer: "We track clicks, views, geographic location (country/city), device types, browsers, referrers, and peak traffic times. All data is anonymized and GDPR compliant.",
          tags: ["analytics", "data", "tracking"]
        },
        {
          question: "How accurate are the analytics?",
          answer: "Our analytics are highly accurate and update in real-time. We use advanced tracking methods to ensure reliable data while respecting user privacy.",
          tags: ["accuracy", "realtime", "tracking"]
        },
        {
          question: "Can I export my analytics data?",
          answer: "Yes! Premium users can export all analytics data as CSV files for further analysis in Excel, Google Sheets, or other tools.",
          tags: ["export", "csv", "data"]
        }
      ]
    }
  ];

  // Memoized handlers for better performance
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleToggleItem = useCallback((index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  }, [openIndex]);

  // Search functionality
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return faqData;
    
    const query = searchQuery.toLowerCase();
    return faqData.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    })).filter(section => section.items.length > 0);
  }, [searchQuery]);

  return (
    <>
      {/* Hero Header */}
      <motion.div 
        className="w-full flex flex-col justify-center items-center h-auto min-h-16 mb-12 bg-white/95 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-xl border border-white/60 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      > 
        {/* Enhanced background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/75 via-amber-50/60 to-white/85" />
        
        {/* Floating elements */}
        <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-orange-300/22 to-amber-300/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 right-4 w-20 h-20 bg-gradient-to-br from-amber-300/20 to-orange-300/22 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        {/* Enhanced accent line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ background: 'linear-gradient(to right, #B73D00, #ED7B00, #E66426)' }}
        />
        
        <div className="relative z-10 text-center">
          <motion.h1 
          className="text-3xl md:text-4xl font-black text-center mb-3 text-transparent bg-clip-text drop-shadow-sm tracking-tight"
          style={{ background: 'linear-gradient(to right, #B73D00, #ED7B00, #E66426)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            className="text-base text-gray-700 font-semibold max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Got Questions? We've Got You Covered with Detailed Answers.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            className="relative max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-500"
                aria-label="Search frequently asked questions"
                role="searchbox"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <motion.p 
                className="text-sm text-gray-600 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {filteredData.reduce((acc, section) => acc + section.items.length, 0)} result(s) found
              </motion.p>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="space-y-6">
          {filteredData.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500">Try searching with different keywords or browse all questions below.</p>
              <button 
                onClick={handleClearSearch}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-lg hover:from-orange-500 hover:to-amber-600 transition-all duration-300"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            filteredData.map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              className="bg-white/97 backdrop-blur-xl rounded-xl p-6 shadow-xl border border-orange-100/50 relative overflow-hidden hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * sectionIndex + 0.3 }}
            >
              {/* Enhanced background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50" />
              
              {/* Category accent */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: 'linear-gradient(to right, #ED7B00, #E66426, #ED7B00)' }}
              />
              
              <div className="relative z-10">
                <motion.h2 
                  className="text-xl font-black mb-6 text-gray-900 flex items-center gap-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg">
                    <section.icon className="w-4 h-4" />
                  </div>
                  {section.category}
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {section.items.length} question{section.items.length !== 1 ? 's' : ''}
                  </span>
                </motion.h2>                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => {
                    const index = sectionIndex * 10 + itemIndex;
                    const isOpen = openIndex === index;
                    
                    return (
                      <motion.div
                        key={itemIndex}
                        className="border rounded-lg overflow-hidden bg-white/70 backdrop-blur-sm transition-all duration-300"
                        style={{ borderColor: 'rgba(237, 123, 0, 0.3)', '--hover-border-color': 'rgba(230, 100, 38, 0.5)' } as React.CSSProperties}
                        whileHover={{ scale: 1.01 }}
                        role="region"
                        aria-labelledby={`question-${index}`}
                      >
                        <motion.div
                          className="flex justify-between items-center p-4 cursor-pointer transition-colors duration-300 hover:bg-orange-50/50"
                          onClick={() => handleToggleItem(index)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleToggleItem(index);
                            }
                          }}
                          whileHover={{ x: 5 }}
                          tabIndex={0}
                          role="button"
                          aria-expanded={isOpen}
                          aria-controls={`answer-${index}`}
                          id={`question-${index}`}
                        >
                          <div className="flex-1 pr-4">
                            <h3 className="text-base font-bold text-gray-900 mb-2">
                              {item.question}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag, tagIndex) => (
                                <span 
                                  key={tagIndex}
                                  className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <motion.div
                            className="flex items-center justify-center w-8 h-8 rounded-full shadow-md bg-gradient-to-br from-orange-400 to-amber-500 text-white"
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </motion.div>
                        </motion.div>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                              id={`answer-${index}`}
                              role="region"
                              aria-labelledby={`question-${index}`}
                            >
                              <div className="px-4 pb-4 pt-0">
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border-l-4 border-orange-400">
                                  <p className="text-gray-700 font-medium leading-relaxed text-sm">
                                    {item.answer}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>
        
        {/* Contact Support Section */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Still have questions?</h3>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <a 
              href="mailto:clinkr.work@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-lg hover:from-orange-500 hover:to-amber-600 transition-all duration-300 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default memo(FAQ);
