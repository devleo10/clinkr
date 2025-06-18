

const PremiumCard = () => {
  return (
    <div className="w-full border-2 p-5 rounded-[10px] hover:border-[#4F46E5] flex flex-col justify-between min-h-[300px]">
        <div>
          <div className="flex flex-row justify-between">
              <div>
                  <p className="text-2xl md:text-4xl font-bold">Premium</p>
                  <p className="text-gray-600 text-sm">For serious track of links</p>
              </div>
              <div>
                  <p className="text-2xl md:text-4xl font-bold">$2.99</p>
                  <p className="text-gray-600 text-sm">Per Month</p>
              </div>
          </div>
          <div className="mt-8 space-y-4">
              <p className="text-sm">✅ Everything in Free</p>
              <p className="text-sm">✅ Geo heatmaps</p>
              <p className="text-sm">✅ Device analytics</p>
              <p className="text-sm">✅ CSV exports</p>
              <p className="text-sm">✅ Unlimited links</p>
          </div>
        </div>
        <div className="w-full rounded-[10px] bg-[#4F46E5] hover:bg-[#3d35b8] transition-colors duration-300 mt-5">
            <button className="text-md text-white py-2 px-4 w-full rounded-[10px]">
                Upgrade to premium
            </button>
        </div>
    </div>
  )
}


export default PremiumCard