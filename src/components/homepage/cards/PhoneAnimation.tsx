import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import sc1 from '../../../assets/sc1.png';
import sc2 from '../../../assets/sc2.png';
import sc3 from '../../../assets/sc3.png';
import sc4 from '../../../assets/sc4.png';
import sc5 from '../../../assets/sc5.png';

const PhoneAnimation: React.FC = () => {
  const analyticsImages = [sc1, sc2, sc3, sc4, sc5];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % analyticsImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [analyticsImages.length]);

  return (
    <motion.div
      className="flex justify-center items-center py-8 mt-10 sm:mt-[-60px]"
      initial={{ y: 0 }}
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
    >
      <motion.div 
        className="bg-gradient-to-b from-indigo-50 to-blue-100 rounded-[2.5rem] p-2 sm:p-4 md:p-6 shadow-xl flex flex-col items-center h-[340px] w-[95vw] max-w-xs sm:max-w-md md:max-w-[440px] md:h-[460px] lg:h-[480px] lg:w-[300px] lg:max-w-none xl:w-[340px] 2xl:w-[450px] mt-[-30px] sm:mt-[70px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <div
          className="relative mx-auto w-[140px] h-[280px] mt-5 sm:mt-0 sm:w-[180px] sm:h-[370px] md:w-[190px] md:h-[370px] lg:w-[220px] lg:h-[480px] flex items-center justify-center"
          style={{
            perspective: "1000px",
            transform: "rotateX(20deg) rotateY(-20deg)",
          }}
        >
          {/* Mobile Frame with Silver-Metallic Body */}
          <div className="absolute inset-0 rounded-[1.2rem] sm:rounded-[1.5rem] p-1 ">
            <div className="w-full h-full rounded-[1.2rem] sm:rounded-[2.4rem] p-0.5 sm:p-1 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-700">
              <div className="w-full h-full rounded-[1.2rem] sm:rounded-[2.2rem] p-0.5 sm:p-0.5 bg-gradient-to-br from-gray-500 to-gray-900">
                <div className="w-full h-full bg-gray-50 rounded-[1rem] sm:rounded-[2.2rem] overflow-hidden relative">
                  
                  {/* Camera Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-black rounded-b-lg w-10 h-4 sm:w-12 sm:h-5 relative shadow-sm">
                      {/* Camera Lens */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-800 rounded-full border border-gray-600">
                          {/* Lens Center */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-gray-900 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Screen Carousel */}
                  <div className="pt-5 sm:pt-6">
                    {analyticsImages.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 pt-5 sm:pt-6 transition-all duration-1000  ${
                          index === currentIndex
                            ? "opacity-100 transform scale-100"
                            : "opacity-0 transform scale-105"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Analytics Screenshot ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhoneAnimation;