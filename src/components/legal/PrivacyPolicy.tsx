
import Navbar from '../homepage/Navbar';
import Footer from '../homepage/Footer';
import { motion } from 'framer-motion';
import BoltBackground from '../homepage/BoltBackground';
import { Shield, Eye, Lock, FileText, Users, Globe } from 'lucide-react';
import { memo } from 'react';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: FileText,
      content: [
        "The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.",
        "If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.",
        "When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number."
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        "We use the information we collect in various ways, including to:",
        [
          "Provide, operate, and maintain our website",
          "Improve, personalize, and expand our website",
          "Understand and analyze how you use our website",
          "Develop new products, services, features, and functionality",
          "Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes",
          "Send you emails",
          "Find and prevent fraud"
        ]
      ]
    },
    {
      title: "Data Security",
      icon: Lock,
      content: [
        "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
        "All data transmission is encrypted using industry-standard SSL/TLS protocols.",
        "We regularly review our security practices and update them as necessary to maintain the highest level of protection."
      ]
    },
    {
      title: "Your Rights",
      icon: Users,
      content: [
        "You have the right to access, update, or delete your personal information at any time.",
        "You can opt out of marketing communications by clicking the unsubscribe link in any email.",
        "You have the right to data portability and can request a copy of your data in a structured format.",
        "You can contact us at any time to exercise these rights."
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen font-inter relative"
         style={{
           background: 'radial-gradient(at 15% 20%, rgba(255, 237, 213, 0.3) 0%, transparent 55%), radial-gradient(at 85% 30%, rgba(255, 245, 235, 0.3) 0%, transparent 60%), radial-gradient(at 70% 80%, rgba(255, 251, 248, 0.3) 0%, transparent 55%), linear-gradient(130deg, var(--c-bg), #FAFAFA)',
         }}>
      <BoltBackground />
      <Navbar />
      <main className="flex-grow container mx-auto p-8 pt-24 relative z-10">
        <motion.div 
          className="glass-card bg-white/80 backdrop-blur-lg border border-white/30 rounded-xl shadow-lg p-8 relative overflow-hidden max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/50 to-orange-100/50 opacity-70" />
          
          {/* Animated accent */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <div className="relative z-10">
            {/* Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400">
                  Privacy Policy
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </motion.div>

            {/* Introduction */}
            <motion.div 
              className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At Clinkr, accessible from clinkr.live, one of our main priorities is the privacy of our visitors. 
                This Privacy Policy document contains types of information that is collected and recorded by Clinkr and how we use it.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
        </p>
            </motion.div>

            {/* Main Content Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg shadow-md flex-shrink-0">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
                      <div className="space-y-3">
                        {section.content.map((item, itemIndex) => (
                          <div key={itemIndex}>
                            {typeof item === 'string' ? (
                              <p className="text-gray-700 leading-relaxed">{item}</p>
                            ) : (
                              <div>
                                <p className="text-gray-700 leading-relaxed mb-2">{item[0]}</p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                  {item.slice(1).map((listItem, listIndex) => (
                                    <li key={listIndex} className="text-gray-600">{listItem}</li>
                                  ))}
        </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Legal Sections */}
            <motion.div 
              className="mt-12 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">GDPR Compliance</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We are fully compliant with the General Data Protection Regulation (GDPR). 
                  This means we respect your privacy rights and provide you with control over your personal data.
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
        </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">CCPA Compliance</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  For California residents, we comply with the California Consumer Privacy Act (CCPA).
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of the sale of personal information</li>
                  <li>Right to non-discrimination for exercising privacy rights</li>
        </ul>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div 
              className="mt-12 text-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">Questions About This Policy?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our data practices, 
                please don't hesitate to contact us.
              </p>
              <a 
                href="mailto:clinkr.work@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-lg hover:from-orange-500 hover:to-amber-600 transition-all duration-300 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </a>
            </motion.div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default memo(PrivacyPolicy);
