
import { motion } from 'framer-motion';
import { Heart, Shield, Zap, Users, Target, Mail } from 'lucide-react';
import { memo } from 'react';

const About = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed with modern technologies and optimized performance."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is never sold. We believe privacy is a fundamental right."
    },
    {
      icon: Users,
      title: "User Centered",
      description: "Designed with creators and professionals in mind for maximum usability."
    },
    {
      icon: Target,
      title: "Analytics Driven",
      description: "Make data-driven decisions with comprehensive, real-time insights."
    }
  ];

  const values = [
    {
      title: "Why Clinkr?",
      items: [
        "Simple, elegant, and customizable link-in-bio pages for everyone.",
        "Real-time analytics to help you understand your audience and optimize your content.",
        "Privacy-first: We never sell your data and you control your information.",
        "Easy integration with your favorite social platforms and tools.",
        "Built for speed, security, and a delightful user experience."
      ]
    },
    {
      title: "Our Vision",
      description: "We believe everyone deserves a beautiful digital home. Clinkr is committed to continuous improvement, listening to our users, and building features that matter most to you. Whether you're a creator, business, or enthusiast, Clinkr helps you grow and connect with your audience."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="inline-flex items-center gap-3 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400">
            About Clinkr
          </h1>
        </motion.div>
        
        <motion.p 
          className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Clinkr is a modern, privacy-focused link-in-bio and analytics platform designed for creators, 
          entrepreneurs, and professionals. Our mission is to empower users to showcase their work, 
          connect all their important links, and understand their audience with beautiful, actionable analytics.
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
            whileHover={{ y: -5 }}
            role="article"
            aria-labelledby={`feature-title-${index}`}
          >
            <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg shadow-md w-fit mx-auto mb-4" aria-hidden="true">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 id={`feature-title-${index}`} className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="space-y-12">
        {values.map((section, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 rounded-2xl p-8 border border-orange-100/50 shadow-lg"
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 + index * 0.2 }}
            role="article"
            aria-labelledby={`section-title-${index}`}
          >
            <h2 id={`section-title-${index}`} className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full" aria-hidden="true"></div>
              {section.title}
            </h2>
            
            {section.items ? (
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <motion.li 
                    key={itemIndex}
                    className="flex items-start gap-3 text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + index * 0.2 + itemIndex * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full mt-2 flex-shrink-0" aria-hidden="true"></div>
                    <span className="leading-relaxed">{item}</span>
                  </motion.li>
                ))}
      </ul>
            ) : (
              <motion.p 
                className="text-gray-700 leading-relaxed text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
              >
                {section.description}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Contact Section */}
      <motion.div 
        className="mt-16 text-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg" aria-hidden="true">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Contact & Support</h3>
        </div>
        
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Have questions, feedback, or need help? We're here to support you every step of the way. 
          Reach out to us anytime and we'll get back to you as soon as possible.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="mailto:clinkr.work@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-lg hover:from-orange-500 hover:to-amber-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            aria-label="Send email to clinkr.work@gmail.com"
          >
            <Mail className="w-5 h-5" aria-hidden="true" />
            clinkr.work@gmail.com
          </a>
          
          <div className="text-sm text-gray-500">
            <p>Response time: Usually within 24 hours</p>
            <p>Available: Monday - Friday, 9 AM - 6 PM EST</p>
          </div>
        </div>
      </motion.div>
  </div>
);
};

export default memo(About);
