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
    <div className="w-full flex flex-col justify-center items-center h-auto min-h-20 mb-10 md:mb-20 bg-white/90 backdrop-blur-xl rounded-xl px-4 py-8 md:py-10 shadow-xl border border-white/50 relative overflow-hidden"> 
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
        
        {/* Animated accent line */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 drop-shadow-sm tracking-tight relative z-10">
          Frequently Asked Questions
        </motion.h1>
        <h2 className="flex flex-col text-sm text-gray-800 font-semibold relative z-10">Got Questions? We've Got You Covered.</h2>
    </div>
    <div className="max-w-3xl mx-auto py-12 px-4">
     
      <div className="space-y-6">
        {faqData.map((section, sectionIndex) => (
          <motion.div 
            key={sectionIndex} 
            className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/50 relative overflow-hidden hover:shadow-2xl transition-all"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
            whileHover={{ 
              y: -2,
              boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.15)"
            }}
          >
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
            
            {/* Animated accent line */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: sectionIndex * 0.2 }}
            />
            
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold mb-4 text-gray-900 relative z-10"
            >
              {section.category}
            </motion.h2>
            
            <div className="space-y-2 relative z-10">
              {section.items.map((item, itemIndex) => {
                const index = sectionIndex * 10 + itemIndex;
                return (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <div
                      className="flex justify-between items-center py-4 cursor-pointer hover:bg-white/50 rounded-lg px-2 transition-colors"
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                      <h3 className="text-sm font-semibold text-gray-900 flex-1 pr-4">{item.question}</h3>
                      <motion.div
                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-indigo-700 font-bold text-sm shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>
                    
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-4 px-2 text-sm text-gray-700 font-medium leading-relaxed">{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};

export default FAQ;
