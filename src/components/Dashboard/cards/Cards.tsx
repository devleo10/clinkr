import TotalClicks from './TotalClicks';
import TopCountry from './TopCountry';
import DeviceSplit from './DeviceSplit';
import { motion } from 'framer-motion';

const animationProps = {
  initial: { y: 0 },
  animate: { y: [0, 2, 0] },
  transition: {
    duration: 1, 
    ease: 'easeInOut',
    repeat: Infinity,
  },
};

const Cards = () => {
  return (
    <div className="w-full sm:mt-10 flex flex-col h-auto min-h-20 mb-10 md:mb-20  px-6 md:px-10 py-6 md:py-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <motion.div {...animationProps}>
          <TotalClicks />
        </motion.div>
        <motion.div {...animationProps}>
          <TopCountry />
        </motion.div>
        <motion.div {...animationProps}>
          <DeviceSplit />
        </motion.div>
      </div>
    </div>
  );
};

export default Cards;
