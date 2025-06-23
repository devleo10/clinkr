import { Link } from 'react-router-dom';

const FreeCard = () => {
  return (
    <div className="w-full border-2 p-5 rounded-[10px] hover:border-black flex flex-col justify-between min-h-[200px] sm:[w-full border-2 p-5 rounded-[10px] hover:border-black flex flex-col justify-between min-h-[200px]]">
        <div>
          <div className="flex flex-row justify-between">
              <div>
                  <p className="text-2xl md:text-4xl font-bold">Free</p>
                  <p className="text-gray-600 text-sm">Perfect to get started</p>
              </div>
              <div>
                  <p className="text-2xl md:text-4xl font-bold">$0</p>
                  <p className="text-gray-600 text-sm">Forever free</p>
              </div>
          </div>
          <div className="mt-8 space-y-4">
              <p className="text-sm">✅ Click Tracking</p>
              <p className="text-sm">✅ Basic Analytics</p>
              <p className="text-sm">✅ Up to 5 links</p>
          </div>
        </div>
        <div className="w-full rounded-[10px] mb-20 mt-5 bg-[#E5E7EB]">
            <Link to="/signup" className="block">
                <button className="text-md  py-2 px-4 w-full transition-all duration-300 hover:bg-gray-300 rounded-[10px]">
                    Get Started
                </button>
            </Link>
        </div>
    </div>
  )
}

export default FreeCard