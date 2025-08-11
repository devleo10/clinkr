
const BoltBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-white via-orange-50/80 to-orange-200/80">
      {/* Modern gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-transparent to-orange-100/40" />
      
      {/* Animated grid pattern */}
      <div 
        className="absolute h-screen w-full opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(251, 146, 60, 0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(251, 146, 60, 0.22) 1px, transparent 1px)
          `,
          backgroundSize: '90px 90px',
          animation: 'gridMove 25s linear infinite',
        }}
      />
      
      {/* Enhanced floating orbs with different sizes */}
      <div 
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-white/70 to-orange-200/40 animate-pulse"
        style={{ 
          left: '12%', 
          top: '15%',
          filter: 'blur(110px)',
          animationDelay: '0s',
          animationDuration: '5s',
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-orange-100/60 to-orange-300/30 animate-pulse"
        style={{ 
          right: '18%', 
          top: '25%',
          filter: 'blur(130px)',
          animationDelay: '2.5s',
          animationDuration: '6s',
        }}
      />
      <div 
        className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-white/60 to-orange-100/40 animate-pulse"
        style={{ 
          left: '45%', 
          top: '65%',
          transform: 'translateX(-50%)',
          filter: 'blur(90px)',
          animationDelay: '1.2s',
          animationDuration: '7s',
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-orange-400/35 to-amber-500/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Enhanced light rays effect */}
      <div 
        className="absolute w-[160vw] h-[130vh]"
        style={{
          top: '-15%',
          left: '-30%',
          background: `
            radial-gradient(ellipse 130% 90% at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 90% 70% at 80% 20%, rgba(251, 146, 60, 0.10) 0%, transparent 55%)
          `,
          opacity: 0.9,
        }}
      />
      
      {/* Bottom gradient accent */}
      <div
        className="absolute w-full h-[55vh] bottom-0 bg-gradient-to-t from-white/80 via-orange-50/40 to-transparent"
        style={{ opacity: 0.7 }}
      />
      
      {/* Corner accent lights */}
      <div 
        className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-white/70 to-orange-100/30 rounded-full blur-3xl"
      />
      <div 
        className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/60 to-orange-100/20 rounded-full blur-2xl"
      />
      
      <style>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(90px, 90px);
          }
        }
      `}</style>
    </div>
  );
};

export default BoltBackground;
