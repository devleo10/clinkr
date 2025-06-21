import { motion } from "framer-motion";

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
    <motion.div
      className="rounded-full h-16 w-16 border-b-4 border-[#4F46E5] mb-6"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
    <motion.div
      className="text-2xl font-semibold text-[#4F46E5] tracking-wide"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    >
      Loading<span className="animate-pulse">...</span>
    </motion.div>
  </div>
);

export default LoadingScreen;