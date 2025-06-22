import { Link } from 'react-router-dom';
import logo from '../../assets/Frame.png';

const Navbar = () => {
  return (
    <nav className="border-b bg-[#f9faf7f8] mb-8 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="flex items-center justify-between w-full">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-2 w-1/4">
            <Link to="/homepage" className="flex items-center gap-1 sm:gap-2">
              <img 
                src={logo} 
                alt="Clinkr Logo" 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold relative group">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300">
                  Clinkr
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </h1>
            </Link>
          </div>

          {/* Centered Analytics Dashboard text */}
          <span className="font-bold text-2xl sm:text-3xl text-gray-800 text-center w-1/3">
            Analytics Dashboard
          </span>

          {/* Right Section */}
          <div className="flex items-center space-x-4 w-1/4 justify-end">
            <Link to="/privateprofile">
              <button className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:from-blue-500 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300">
                Visit Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
