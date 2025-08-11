import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = [
    {
      category: "General Questions",
      items: [
        {
          question: "What is Clinkr?",
          answer: "Clinkr is a modern link-in-bio and analytics platform that helps you organize all your important links and track audience engagement in real time."
        },
        {
          question: "Is there really a free plan?",
          answer: "Yes! Track unlimited links forever. Premium only adds advanced features like geographic data."
        },
        {
          question: "Is my data private and secure?",
          answer: "Absolutely. We never sell your data, and you control your information. All analytics are anonymized."
        }
      ]
    },
    {
      category: "Setup & Usage",
      items: [
        {
          question: "How do I add links to my bio?",
          answer: "Sign up, paste your URL, and we'll generate a custom 'clinkr.live/yourname' page. Share that in your bio!"
        },
        {
          question: "Can I customize how my links look?",
          answer: "Yes! Edit titles, add thumbnails, and reorder links anytime."
        },
        {
          question: "Can I see which links are most popular?",
          answer: "Yes, your dashboard shows real-time analytics for every link, including clicks, top countries, and devices."
        },
        {
          question: "How do I reset my password?",
          answer: "Go to the login page and click 'Forgot Password' to receive a reset link via email."
        }
      ]
    },
    {
      category: "Premium Features",
      items: [
        {
          question: "What's included in the Premium plan?",
          answer: "Geo heatmaps, device/browser stats, CSV exports, custom domains, and priority support."
        },
        {
          question: "Can I cancel Premium anytime?",
          answer: "Absolutely. No hidden fees—cancel with one click from your dashboard."
        },
        {
          question: "How do I upgrade to Premium?",
          answer: "Go to your dashboard and click the 'Upgrade' button. You can pay monthly or annually."
        }
      ]
    }
  ];

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
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-t-2xl"
        />
        
        <div className="relative z-10 text-center">
          <motion.h1 
            className="text-3xl md:text-4xl font-black text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 drop-shadow-sm tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            className="text-base text-gray-700 font-semibold max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Got Questions? We've Got You Covered with Detailed Answers.
          </motion.p>
        </div>
      </motion.div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="space-y-6">
          {faqData.map((section, sectionIndex) => (
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
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-t-xl"
              />
              
              <div className="relative z-10">
                <motion.h2 
                  className="text-xl font-black mb-6 text-gray-900 flex items-center gap-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                  {section.category}
                </motion.h2>                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => {
                    const index = sectionIndex * 10 + itemIndex;
                    const isOpen = openIndex === index;
                    
                    return (
                      <motion.div
                        key={itemIndex}
                        className="border border-orange-200/60 rounded-lg overflow-hidden bg-white/70 backdrop-blur-sm hover:border-orange-300 transition-all duration-300"
                        whileHover={{ scale: 1.01 }}
                      >
                        <motion.div
                          className="flex justify-between items-center p-4 cursor-pointer hover:bg-orange-50/50 transition-colors duration-300"
                          onClick={() => setOpenIndex(isOpen ? null : index)}
                          whileHover={{ x: 5 }}
                        >
                          <h3 className="text-base font-bold text-gray-900 flex-1 pr-4">
                            {item.question}
                          </h3>
                          <motion.div
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 shadow-md"
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
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
                            >
                              <div className="p-4 pt-0 text-gray-600 font-medium leading-relaxed text-sm">
                                {item.answer}
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
          ))}
        </div>
      </div>
    </>
  );
};

export default FAQ;
