import TotalClicks from './TotalClicks';
import TopCountry from './TopCountry';
import DeviceSplit from './DeviceSplit';
import { motion } from 'framer-motion';

const Cards = () => {
  return (
    <div className="w-full sm:mt-10 flex flex-col h-auto min-h-20 mb-10 md:mb-20 px-6 md:px-10 py-6 md:py-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -5 }}
        >
          <TotalClicks />
        </motion.div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -5 }}
        >
          <TopCountry />
        </motion.div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -5 }}
        >
          <DeviceSplit />
        </motion.div>
      </div>
    </div>
  );
};

export default Cards;