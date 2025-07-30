
const BoltBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-b from-blue-50 via-indigo-50/80 to-purple-50/90">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 via-transparent to-purple-100/30" />
      
      {/* Modern wave effect (static grid, no animation) */}
      <div 
        className="absolute h-screen w-full"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(79, 70, 229, 0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(79, 70, 229, 0.13) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Subtle accent circles */}
      <div 
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-400/10 to-indigo-500/10"
        style={{ 
          left: '20%', 
          top: '30%',
          filter: 'blur(80px)',
          opacity: 0.35,
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-400/10"
        style={{ 
          right: '10%', 
          top: '20%',
          filter: 'blur(100px)',
          opacity: 0.25,
        }}
      />
      {/* Light rays effect */}
      <div 
        className="absolute w-[120vw] h-[100vh]"
        style={{
          top: '0%',
          left: '-10%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(79, 70, 229, 0.07) 0%, transparent 70%)',
          opacity: 0.7,
        }}
      />
      {/* Bottom accent */}
      <div
        className="absolute w-full h-[40vh] bottom-0 bg-gradient-to-t from-indigo-100/20 to-transparent"
        style={{ opacity: 0.45 }}
      />
    </div>
  );
};

export default BoltBackground;
