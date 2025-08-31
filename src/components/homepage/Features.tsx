
import { motion } from 'framer-motion';

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const features = [
    {
      title: "Real-time Analytics",
      description: "Track clicks, views, and engagement metrics in real-time with detailed insights.",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-50/60 via-amber-50/40 to-orange-50/50",
      hoverColor: "orange-200"
    },
    {
      title: "Geographic Insights",
      description: "Know where your visitors come from with detailed geographic data and heat maps.",
      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50/60 via-orange-50/40 to-orange-50/50",
      hoverColor: "orange-200"
    },
    {
      title: "Device Analytics",
      description: "Track user devices and browsers to optimize experiences across platforms.",
      icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      gradient: "from-orange-600 to-orange-700",
      bgGradient: "from-orange-50/60 via-orange-50/40 to-orange-50/50",
      hoverColor: "orange-300"
    },
    {
      title: "Browser Insights",
      description: "Monitor browser usage patterns and optimize for different platforms.",
      icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50/60 via-orange-50/40 to-orange-50/50",
      hoverColor: "orange-200"
    },
    {
      title: "Link Performance",
      description: "Comprehensive metrics with conversion tracking and user journey analysis.",
      icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50/60 via-orange-50/40 to-orange-50/50",
      hoverColor: "red-200"
    },
    {
      title: "Smart Insights",
      description: "AI-powered recommendations to optimize your link strategy for maximum impact.",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      gradient: "from-amber-600 to-orange-500",
      bgGradient: "from-amber-50/60 via-orange-50/40 to-amber-50/50",
      hoverColor: "amber-200"
    }
  ];

  return (
    <div id="features"> 
      <div className="py-12 mt-8 mx-auto glass-card bg-white/97 backdrop-blur-xl w-full rounded-2xl shadow-xl border border-orange-100/40 relative overflow-hidden">
        {/* Enhanced background with multiple layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/60 opacity-95" />
        
        {/* Floating background elements with improved animations */}
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-orange-300/20 to-amber-400/18 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-amber-400/18 to-orange-400/20 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-t-2xl" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 drop-shadow-sm tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Powerful Features for Your Bio Links
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-700 font-medium max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Everything you need to track, analyze, and optimize your link performance
            </motion.p>
          </motion.div>

          {/* Uniform Grid Layout */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="group relative bg-white/85 backdrop-blur-md border border-gray-200/70 rounded-xl p-6 hover:shadow-xl hover:border-orange-200 transition-all duration-500 overflow-hidden h-64"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Dynamic gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Floating orb effect */}
                <motion.div 
                  className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br ${feature.gradient.replace('to-', 'to-').replace('from-', 'from-')}/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }}
                />
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-all duration-300`}
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                      </svg>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-lg font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300 flex-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {feature.title}
                    </motion.h3>
                  </div>
                  
                  <motion.p 
                    className="text-gray-600 font-medium leading-relaxed text-sm flex-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {feature.description}
                  </motion.p>
                  
                  {/* Interactive hover element */}
                  <motion.div
                    className="absolute bottom-4 right-4 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle, var(--c-accent) 0%, rgba(255, 122, 26, 0.3) 100%)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Features