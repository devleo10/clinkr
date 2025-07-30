

const PremiumCard = () => {
  return (
    <div 
      className="w-full glass-card bg-white/90 backdrop-blur-lg border border-white/50 p-6 rounded-xl hover:border-indigo-300 flex flex-col justify-between shadow-xl hover:shadow-2xl relative overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-90" />
      
      {/* Accent line (static) */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
      />
      {/* Corner decoration (static) */}
      <div
        className="absolute bottom-0 right-0 w-16 h-16 opacity-15"
      >
        <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-purple-500 to-indigo-500" />
      </div>
      
      {/* Shiny effect */}
      <div className="shiny-effect"></div>
      
      <div className="relative z-10">
        <div>
          <div className="flex flex-row justify-between">
              <div>
                  <p className="text-2xl md:text-4xl font-bold text-gray-900">Premium</p>
                  <p className="text-gray-700 text-sm font-semibold">For serious track of links</p>
              </div>
              <div>
                  <p className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">$2.99</p>
                  <p className="text-gray-700 text-sm font-semibold">Per Month</p>
              </div>
          </div>
          <div className="mt-8 space-y-4">
              <p className="text-sm font-semibold flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-800">Everything in Free</span>
              </p>
              <p className="text-sm font-semibold flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-800">Geo heatmaps</span>
              </p>
              <p className="text-sm font-semibold flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-800">Device analytics</span>
              </p>
              <p className="text-sm font-semibold flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-800">CSV exports</span>
              </p>
              <p className="text-sm font-semibold flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-800">Unlimited links</span>
              </p>
          </div>
        </div>
        <div 
          className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-6 py-2.5 rounded-lg shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 mt-6 flex justify-center items-center relative overflow-hidden"
        >
            <button>
                Upgrade to premium
            </button>
        </div>
      </div>
      
      <style>{`
        .shiny-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: skewX(-30deg);
          animation: shiny 5s infinite;
        }

        @keyframes shiny {
          0% {
            left: -100%;
          }
          20%, 100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default PremiumCard