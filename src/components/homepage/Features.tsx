import { motion } from "framer-motion"
const Features = () => {
  return (
    <div id="features"> 
      <div className="py-24 mt-10 mx-auto glass-card bg-white/90 backdrop-blur-lg w-full rounded-xl shadow-xl border border-white/50 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
        
        {/* Animated top accent */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-20">
        <motion.h2 
          className="text-3xl md:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 drop-shadow-sm tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Powerful Features for Your Bio Links
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-800 font-medium max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Everything you need to track, analyze, and optimize your link performance
        </motion.p>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Analytics Feature */}
        <motion.div 
          className="glass-card bg-white/90 backdrop-blur-lg border border-white/50 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ 
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
          
          {/* Animated accent line */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          {/* Animated corner decoration */}
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 opacity-15"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-purple-500 to-indigo-500" />
          </motion.div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 shadow-lg">
              <svg className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Real-time Analytics</h3>
            <p className="text-gray-700 font-medium leading-relaxed">Track clicks, views, and engagement metrics in real-time. Understand your audience's behavior with detailed insights.</p>
          </div>
        </motion.div>

        {/* Geography Feature */}
        <motion.div 
          className="glass-card bg-white/90 backdrop-blur-lg border border-white/50 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ 
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
          
          {/* Animated accent line */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          
          {/* Animated corner decoration */}
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 opacity-15"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-purple-500 to-indigo-500" />
          </motion.div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 shadow-lg">
              <svg className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Geographic Insights</h3>
            <p className="text-gray-700 font-medium leading-relaxed">Know where your visitors come from with detailed geographic data. Target your content to your audience's location.</p>
          </div>
        </motion.div>

        {/* Device Analytics Feature */}
        <motion.div 
          className="glass-card bg-white/90 backdrop-blur-lg border border-white/50 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ 
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
          
          {/* Animated accent line */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          
          {/* Animated corner decoration */}
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 opacity-15"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-purple-500 to-indigo-500" />
          </motion.div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 shadow-lg">
              <svg className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Device Analytics</h3>
            <p className="text-gray-700 font-medium leading-relaxed">Understand how users access your links across different devices and browsers. Optimize for the best user experience.</p>
          </div>
        </motion.div>

        {/* Trend Analysis Feature */}
        <motion.div 
          className="glass-card bg-white/90 backdrop-blur-lg border border-white/50 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ 
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
          
          {/* Animated accent line */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
          
          {/* Animated corner decoration */}
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 opacity-15"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-purple-500 to-indigo-500" />
          </motion.div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 shadow-lg">
              <svg className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Trend Analysis</h3>
            <p className="text-gray-700 font-medium leading-relaxed">Track growth patterns, peak engagement times, and audience behavior trends. Make data-driven decisions to improve your content strategy.</p>
          </div>
        </motion.div>

        {/* Browser Analytics Feature */}
        <motion.div 
          className="glass-card bg-white/90 backdrop-blur-lg border border-white/50 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ 
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
          
          {/* Animated accent line */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          
          {/* Animated corner decoration */}
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 opacity-15"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-purple-500 to-indigo-500" />
          </motion.div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 shadow-lg">
              <svg className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Browser Analytics</h3>
            <p className="text-gray-700 font-medium leading-relaxed">Monitor browser usage patterns and optimize your links for different web browsers. Ensure consistent performance across all platforms.</p>
          </div>
        </motion.div>

        {/* Smart Insights Feature */}
        <motion.div 
          className="glass-card bg-white/90 backdrop-blur-lg border border-white/50 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ 
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)"
          }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
          
          {/* Animated accent line */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          
          {/* Animated corner decoration */}
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 opacity-15"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-purple-500 to-indigo-500" />
          </motion.div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 shadow-lg">
              <svg className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Smart Insights</h3>
            <p className="text-gray-700 font-medium leading-relaxed">Get AI-powered recommendations and insights about your audience behavior. Discover peak engagement times and optimize your content strategy.</p>
          </div>
        </motion.div>
      </div>
    </div>
  </div></div>
  )
}

export default Features