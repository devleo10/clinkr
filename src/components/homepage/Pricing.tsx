import FreeCard from "./cards/FreeCard"
import PremiumCard from "./cards/PremiumCard"

const Pricing = () => {
  return (
    <>
      <div className="w-full flex h-auto min-h-20 mb-10 md:mb-20 bg-[#F9FAFB] px-4 py-6 md:py-0">
        <p className="w-full flex items-center justify-center text-center text-xl sm:text-2xl">Your bio link is like a blind date—no idea who clicked. Let's change that.</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-8 flex flex-col items-center justify-center">
        <div className="flex flex-col justify-center items-center text-center mb-8">
          <h1 className="text-2xl md:text-5xl font-bold">Choose Your Perfect Plan</h1>
          <p className="text-gray-600 text-lg mt-4">Start Free, Upgrade when you need more</p>
        </div>
        {/* Cards container - column on small screens, row on md and up */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-5xl w-full">
          <FreeCard/>
          <PremiumCard/>
        </div>
      </div>
    </>
  )
}

export default Pricing