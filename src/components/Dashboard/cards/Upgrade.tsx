import { motion } from "framer-motion";

const Upgrade = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className='w-full h-auto min-h-20 mb-10 md:mb-20 bg-[#F9FAFB] px-10 py-6 md:py-0'
    >
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-lg flex justify-between items-center relative overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold">Unlock Advanced Analytics</h2>
          <p className="mt-2">Unlock deeper analytics, exclusive features, and priority support with Premium.</p>
        </div>
        <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded hover:bg-gray-100 transition-colors duration-300">
          Upgrade Now
        </button>
        <div className="shiny-effect"></div> {/* Shiny effect element */}
      </div>
      <style>{`
        .shiny-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.5), transparent);
          transform: skewX(-30deg);
          animation: shiny 2s infinite;
        }

        @keyframes shiny {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </motion.div>
  );
}

export default Upgrade;