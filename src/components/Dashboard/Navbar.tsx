import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../../assets/Frame.png';

const Navbar = () => {
  return (
    <nav className="border-b bg-[#f9faf7f8] mb-8 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="flex items-center justify-between w-full">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-2 w-1/4">
            <Link to="/dashboard" className="flex items-center">
              <img 
                src={logo} 
                alt="ClipMetrics Logo" 
                className="h-6 w-6"
              />
              <span className="ml-2 text-base sm:text-lg font-semibold">
                ClipMetrics
              </span>
            </Link>
          </div>

          {/* Centered Analytics Dashboard text */}
          <span className="font-bold text-gray-700 text-center w-1/3">
            Analytics Dashboard
          </span>

          {/* Right Section */}
          <div className="flex items-center space-x-4 w-1/4 justify-end">
           

            <Link to="/privateprofile">
              <button className="flex items-center space-x-1 rounded-full hover:bg-gray-100 p-2 transition-colors">
                <p className='font-bold text-center '>Visit Profile</p>
                <FaUserCircle size={24} />
              </button>
            </Link>
          </div>
        </div>

       
      </div>
    </nav>
  );
};

export default Navbar;
