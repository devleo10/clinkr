import FreeCard from "./cards/FreeCard"
import PremiumCard from "./cards/PremiumCard"


const Pricing = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center relative">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-transparent to-amber-50/30 rounded-2xl"
      />
      <div 
        className="flex flex-col justify-center items-center text-center mb-12 relative z-10"
      >
        <h1 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 drop-shadow-sm tracking-tight mb-3">Choose Your Perfect Plan</h1>
        <p className="text-gray-800 text-base font-semibold">Start Free, Upgrade when you need more</p>
      </div>
      
      {/* Cards container - column on small screens, row on md and up */}
      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-4xl w-full relative z-10">
        <FreeCard />
        <PremiumCard />
      </div>
    </div>
  )
}

export default Pricing