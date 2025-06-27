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
          question: "How is Clinkr different from other alternatives?",
          answer: "Clinkr gives you real-time click analytics for free—no upgrades needed to see which links perform best."
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
    <div className="w-full flex flex-col justify-center items-center h-auto min-h-20 mb-10 md:mb-20 bg-[#F9FAFB] px-4 py-6 md:py-0 "> 
        <motion.h1 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-medium text-center mb-1">
        Frequently Asked Questions
       </motion.h1>
        <h2 className="flex flex-col text-sm ">Got Questions? We've Got You Covered.</h2>
    </div>
    <div className="max-w-3xl mx-auto py-12 px-4">
     
      <div className="space-y-6">
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-medium mb-4"
            >
              {section.category}
            </motion.h2>
            
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => {
                const index = sectionIndex * 2 + itemIndex;
                return (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100"
                  >
                    <div
                      className="flex justify-between items-center py-3 cursor-pointer"
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                      <h3 className="text-sm">{item.question}</h3>
                      <motion.span
                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ›
                      </motion.span>
                    </div>
                    
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="pb-3 text-sm text-gray-600">{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default FAQ;
