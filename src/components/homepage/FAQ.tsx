import { useState } from 'react';


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
        
        {/* Accent line (static) */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
        />
        <h1 
          className="text-2xl md:text-3xl font-extrabold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 drop-shadow-sm tracking-tight relative z-10">
          Frequently Asked Questions
        </h1>
        <h2 className="flex flex-col text-sm text-gray-800 font-semibold relative z-10">Got Questions? We've Got You Covered.</h2>
    </div>
    <div className="max-w-3xl mx-auto py-12 px-4">
     
      <div className="space-y-6">
        {faqData.map((section, sectionIndex) => (
          <div 
            key={sectionIndex} 
            className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/50 relative overflow-hidden hover:shadow-2xl transition-all"
          >
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
            
            {/* Accent line (static) */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            />
            <h2 
              className="text-lg font-bold mb-4 text-gray-900 relative z-10"
            >
              {section.category}
            </h2>
            
            <div className="space-y-2 relative z-10">
              {section.items.map((item, itemIndex) => {
                const index = sectionIndex * 10 + itemIndex;
                return (
                  <div
                    key={itemIndex}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <div
                      className="flex justify-between items-center py-4 cursor-pointer hover:bg-white/50 rounded-lg px-2 transition-colors"
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                      <h3 className="text-sm font-semibold text-gray-900 flex-1 pr-4">{item.question}</h3>
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-indigo-700 font-bold text-sm shadow-sm transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-500 ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <p className="pb-4 px-2 text-sm text-gray-700 font-medium leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
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
