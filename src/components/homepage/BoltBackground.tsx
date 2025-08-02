
const BoltBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80">
      {/* Modern gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 via-transparent to-purple-100/20" />
      
      {/* Animated grid pattern */}
      <div 
        className="absolute h-screen w-full opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(79, 70, 229, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(79, 70, 229, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          animation: 'gridMove 20s linear infinite',
        }}
      />
      
      {/* Enhanced floating orbs with different sizes */}
      <div 
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/15 to-indigo-500/15 animate-pulse"
        style={{ 
          left: '15%', 
          top: '20%',
          filter: 'blur(100px)',
          animationDelay: '0s',
          animationDuration: '4s',
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-indigo-500/12 to-purple-400/12 animate-pulse"
        style={{ 
          right: '15%', 
          top: '30%',
          filter: 'blur(120px)',
          animationDelay: '2s',
          animationDuration: '5s',
        }}
      />
      <div 
        className="absolute w-60 h-60 rounded-full bg-gradient-to-r from-purple-400/10 to-blue-500/10 animate-pulse"
        style={{ 
          left: '50%', 
          top: '60%',
          transform: 'translateX(-50%)',
          filter: 'blur(80px)',
          animationDelay: '1s',
          animationDuration: '6s',
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      {/* Enhanced light rays effect */}
      <div 
        className="absolute w-[150vw] h-[120vh]"
        style={{
          top: '-10%',
          left: '-25%',
          background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, rgba(79, 70, 229, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)
          `,
          opacity: 0.8,
        }}
      />
      
      {/* Bottom gradient accent */}
      <div
        className="absolute w-full h-[50vh] bottom-0 bg-gradient-to-t from-indigo-100/30 via-purple-50/20 to-transparent"
        style={{ opacity: 0.6 }}
      />
      
      {/* Corner accent lights */}
      <div 
        className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-3xl"
      />
      <div 
        className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-300/20 to-transparent rounded-full blur-2xl"
      />
      
      <style>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(80px, 80px);
          }
        }
      `}</style>
    </div>
  );
};

export default BoltBackground;
