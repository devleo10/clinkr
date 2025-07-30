import { Link } from 'react-router-dom';

const FreeCard = () => {
  return (
    <div 
      className="w-full glass-card bg-white/90 backdrop-blur-lg border border-white/50 p-6 rounded-xl hover:border-gray-300 flex flex-col justify-between shadow-xl hover:shadow-2xl relative overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-90" />
      
      {/* Accent line (static) */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700"
      />
      {/* Corner decoration (static) */}
      <div
        className="absolute bottom-0 right-0 w-16 h-16 opacity-15"
      >
        <div className="absolute inset-0 rounded-tl-full bg-gradient-to-br from-gray-500 to-gray-700" />
      </div>
      
      <div className="relative z-10">
        <div>
          <div className="flex flex-row justify-between">
              <div>
                  <p className="text-2xl md:text-4xl font-bold text-gray-900">Free</p>
                  <p className="text-gray-700 text-sm font-semibold">Perfect to get started</p>
              </div>
              <div>
                  <p className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">$0</p>
                  <p className="text-gray-700 text-sm font-semibold">Forever free</p>
              </div>
          </div>
          <div className="mt-8 space-y-4">
              <p className="text-sm font-semibold flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-800">Click Tracking</span>
              </p>
              <p className="text-sm font-semibold flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-800">Basic Analytics</span>
              </p>
              <p className="text-sm font-semibold flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-gray-800">Up to 5 links</span>
              </p>
          </div>
        </div>
        <div className="w-full mb-8 mt-5">
            <Link to="/signup" className="block">
                <button 
                  className="text-md py-2.5 px-4 w-full transition-all duration-300 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold shadow-lg hover:shadow-xl"
                >
                    Get Started
                </button>
            </Link>
        </div>
      </div>
    </div>
  )
}

export default FreeCard