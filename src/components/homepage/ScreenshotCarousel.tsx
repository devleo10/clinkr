import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Monitor, Smartphone } from 'lucide-react';
import { memo } from 'react';

interface ScreenshotData {
  id: number;
  image: string;
  title: string;
  description: string;
  type: 'dashboard' | 'premium';
  device: 'desktop' | 'mobile';
}

interface AnimationConfig {
  container: {
    initial: { opacity: number; y: number; scale: number };
    animate: { opacity: number; y: number; scale: number };
    transition: Transition;
  };
  slide: {
    initial: { opacity: number; x: number; scale: number };
    animate: { opacity: number; x: number; scale: number };
    exit: { opacity: number; x: number; scale: number };
    transition: Transition;
  };
  autoPlayInterval: number;
  hoverPause: boolean;
}

// Device detection hook
const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return deviceType;
};

const ScreenshotCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const deviceType = useDeviceDetection();

  // Device-specific animation configurations
  const getAnimationConfig = (): AnimationConfig => {
    switch (deviceType) {
      case 'mobile':
        return {
          container: {
            initial: { opacity: 0, y: 20, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: { duration: 0.4, ease: "easeOut" }
          },
          slide: {
            initial: { opacity: 0, x: 30, scale: 0.9 },
            animate: { opacity: 1, x: 0, scale: 1 },
            exit: { opacity: 0, x: -30, scale: 1.1 },
            transition: { duration: 0.3, ease: "easeOut" }
          },
          autoPlayInterval: 4000, // Slower on mobile
          hoverPause: false // Disable hover pause on mobile
        };
      case 'tablet':
        return {
          container: {
            initial: { opacity: 0, y: 15, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: { duration: 0.5, ease: "easeOut" }
          },
          slide: {
            initial: { opacity: 0, x: 20, scale: 0.95 },
            animate: { opacity: 1, x: 0, scale: 1 },
            exit: { opacity: 0, x: -20, scale: 1.05 },
            transition: { duration: 0.4, ease: "easeOut" }
          },
          autoPlayInterval: 3500,
          hoverPause: true
        };
      default: // desktop
        return {
          container: {
            initial: { opacity: 0, y: 10, scale: 0.99 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: { duration: 0.6, ease: "easeOut" }
          },
          slide: {
            initial: { opacity: 0, x: 15, scale: 0.98 },
            animate: { opacity: 1, x: 0, scale: 1 },
            exit: { opacity: 0, x: -15, scale: 1.02 },
            transition: { duration: 0.5, ease: "easeOut" }
          },
          autoPlayInterval: 3000,
          hoverPause: true
        };
    }
  };

  const animationConfig = getAnimationConfig();

  const screenshots: ScreenshotData[] = [
    {
      id: 1,
      image: '/src/assets/sc1.png',
      title: 'Analytics Dashboard',
      description: 'Real-time click tracking and insights',
      type: 'dashboard',
      device: 'desktop'
    },
    {
      id: 2,
      image: '/src/assets/sc2.png',
      title: 'Link Management',
      description: 'Organize and customize your links',
      type: 'dashboard',
      device: 'desktop'
    },
    {
      id: 3,
      image: '/src/assets/sc3.png',
      title: 'Geographic Analytics',
      description: 'See where your audience is located',
      type: 'premium',
      device: 'desktop'
    },
    {
      id: 4,
      image: '/src/assets/sc4.png',
      title: 'Device Analytics',
      description: 'Understand your audience\'s devices',
      type: 'premium',
      device: 'mobile'
    },
    {
      id: 5,
      image: '/src/assets/sc5.png',
      title: 'Export Reports',
      description: 'Download detailed analytics reports',
      type: 'premium',
      device: 'desktop'
    }
  ];

  // Auto-play functionality with device-specific intervals
  useEffect(() => {
    if (isPlaying && (!isHovered || !animationConfig.hoverPause)) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % screenshots.length);
      }, animationConfig.autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isHovered, screenshots.length, animationConfig.autoPlayInterval, animationConfig.hoverPause]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const currentScreenshot = screenshots[currentIndex];

  return (
    <motion.div 
      className="relative w-full max-w-2xl mx-auto px-4 sm:px-0"
      {...animationConfig.container}
    >
      {/* Main Carousel Container */}
      <motion.div 
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={deviceType === 'desktop' ? { scale: 1.01 } : {}}
        transition={{ duration: 0.2 }}
      >
        {/* Device Frame */}
        <div className="relative p-3 sm:p-4 lg:p-6">
          {/* Device Header */}
          <div className="flex items-center justify-end mb-3 sm:mb-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="p-1.5 sm:p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              ) : (
                <Play className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* Screenshot Display */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreenshot.id}
                {...animationConfig.slide}
                className="relative"
              >
                {/* Device Mockup Frame */}
                <div className={`relative mx-auto ${currentScreenshot.device === 'desktop' ? 'w-full max-w-sm sm:max-w-md lg:max-w-lg' : 'w-48 sm:w-56 lg:w-64'}`}>
                  {/* Device Frame */}
                  <div className={`relative rounded-lg sm:rounded-xl overflow-hidden shadow-sm ${
                    currentScreenshot.device === 'desktop' 
                      ? 'bg-gray-200 p-0.5 sm:p-1' 
                      : 'bg-gray-200 p-1 sm:p-1.5'
                  }`}>
                    {/* Screen */}
                    <div className={`bg-white rounded-md sm:rounded-lg overflow-hidden ${
                      currentScreenshot.device === 'desktop' ? 'aspect-video' : 'aspect-[9/16]'
                    }`}>
                      <img
                        src={currentScreenshot.image}
                        alt={currentScreenshot.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Device Details */}
                  {currentScreenshot.device === 'desktop' && (
                    <div className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 transform -translate-x-1/2 w-8 sm:w-12 h-0.5 bg-gray-300 rounded-full"></div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Screenshot Info */}
          <div className="mt-3 sm:mt-4 text-center">
            <motion.h3 
              key={`title-${currentScreenshot.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-base sm:text-lg font-medium text-gray-800 mb-1"
            >
              {currentScreenshot.title}
            </motion.h3>
            <motion.p 
              key={`desc-${currentScreenshot.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xs sm:text-sm text-gray-500"
            >
              {currentScreenshot.description}
            </motion.p>
          </div>
        </div>

        {/* Navigation Arrows - Device-specific visibility */}
        {deviceType !== 'mobile' && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-colors z-10"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-colors z-10"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </>
        )}
      </motion.div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-orange-500 w-5 sm:w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar - Device-specific styling */}
      <div className={`mt-2 sm:mt-3 w-full bg-gray-200 rounded-full overflow-hidden ${
        deviceType === 'mobile' ? 'h-0.5' : 'h-0.5 sm:h-1'
      }`}>
        <motion.div
          className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: isPlaying && (!isHovered || !animationConfig.hoverPause) ? '100%' : '0%' }}
          transition={{ duration: animationConfig.autoPlayInterval / 1000, ease: 'linear' }}
        />
      </div>

      {/* Floating Elements - Device-specific */}
      {deviceType === 'desktop' && (
        <>
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-orange-300/10 to-amber-300/10 rounded-full blur-xl animate-pulse pointer-events-none"></div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-br from-amber-300/10 to-orange-300/10 rounded-full blur-xl animate-pulse delay-1000 pointer-events-none"></div>
        </>
      )}
    </motion.div>
  );
};

export default memo(ScreenshotCarousel);
