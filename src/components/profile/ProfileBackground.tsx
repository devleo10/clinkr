import React from 'react';

const ProfileBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 opacity-80"></div>
      
      {/* Accent circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500 mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-purple-500 mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Particle effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, index) => (
          <div 
            key={index}
            className="absolute w-1 h-1 rounded-full bg-white opacity-80"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              opacity: 0.1 + Math.random() * 0.2
            }}
          ></div>
        ))}
      </div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-[80px] bg-white/5"></div>
    </div>
  );
};

export default ProfileBackground;
