import { motion } from 'framer-motion';

const DashboardBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-b from-blue-50 via-indigo-50/80 to-purple-50/90">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 via-transparent to-purple-100/30" />
      
      {/* Modern wave effect with grid pattern */}
      <motion.div 
        className="absolute h-screen w-full"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(79, 70, 229, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(79, 70, 229, 0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        animate={{
          y: [0, -60, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Subtle accent circles */}
      <motion.div 
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-400/10 to-indigo-500/10"
        style={{ 
          left: '20%', 
          top: '30%',
          filter: 'blur(80px)',
        }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: 'reverse',
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-400/10"
        style={{ 
          right: '10%', 
          top: '20%',
          filter: 'blur(100px)',
        }}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ 
          duration: 10, 
          delay: 1,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: "easeInOut"
        }}
      />
      
      {/* Light rays effect */}
      <motion.div 
        className="absolute w-[120vw] h-[100vh]"
        style={{
          top: '0%',
          left: '-10%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(79, 70, 229, 0.07) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: "easeInOut"
        }}
      />
      
      {/* Bottom accent */}
      <motion.div
        className="absolute w-full h-[40vh] bottom-0 bg-gradient-to-t from-indigo-100/20 to-transparent"
        animate={{
          opacity: [0.4, 0.5, 0.4]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default DashboardBackground;
