import FreeCard from "./cards/FreeCard"
import PremiumCard from "./cards/PremiumCard"


const Pricing = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-12 flex flex-col items-center justify-center relative">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-blue-50/30 rounded-3xl"
      />
      <div 
        className="flex flex-col justify-center items-center text-center mb-16 relative z-10"
      >
        <h1 className="text-2xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 drop-shadow-sm tracking-tight mb-4">Choose Your Perfect Plan</h1>
        <p className="text-gray-800 text-lg font-semibold">Start Free, Upgrade when you need more</p>
      </div>
      
      {/* Cards container - column on small screens, row on md and up */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-5xl w-full relative z-10">
        <FreeCard />
        <PremiumCard />
      </div>
    </div>
  )
}

export default Pricing