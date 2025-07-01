import React from 'react';

const AuthBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 opacity-90"></div>
      
      {/* Animated wave effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path 
              d="M 0 200 C 300 100 600 300 1200 200 L 1200 600 L 0 600 Z" 
              fill="url(#wave1)" 
              className="animate-wave-slow"
            />
            <path 
              d="M 0 300 C 400 200 700 400 1200 300 L 1200 600 L 0 600 Z" 
              fill="url(#wave2)" 
              className="animate-wave-medium"
            />
            <path 
              d="M 0 400 C 500 300 800 500 1200 400 L 1200 600 L 0 600 Z" 
              fill="url(#wave3)" 
              className="animate-wave-fast" 
            />
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      {/* Accent circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-500 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      
      {/* Light rays */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 bg-gradient-to-b from-blue-400 to-transparent opacity-10 rotate-45 blur-2xl"></div>
      
      {/* Particle effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, index) => (
          <div 
            key={index}
            className="absolute w-2 h-2 rounded-full bg-white opacity-80"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              opacity: 0.1 + Math.random() * 0.3
            }}
          ></div>
        ))}
      </div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-[120px] bg-white/5"></div>
    </div>
  );
};

export default AuthBackground;
