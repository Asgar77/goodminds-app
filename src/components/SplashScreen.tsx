import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-goodmind-gradient flex items-center justify-center z-50 transition-all duration-500">
      <div className="text-center animate-scale-in-smooth">
        <div className="w-40 h-40 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-400 rounded-full animate-pulse-soft shadow-2xl"></div>
          <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-inner">
            <img
              src="/GoodMind new logo (13).png"
              alt="GoodMind Logo"
              className="w-24 h-24 object-contain animate-float-gentle drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-24 h-24 flex items-center justify-center';
                fallback.innerHTML = '<span class="text-5xl">🧠</span>';
                e.currentTarget.parentNode?.appendChild(fallback);
              }}
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-goodmind-gradient mb-3 animate-fade-in-smooth">
          goodmind.app
        </h1>
        <p className="text-gray-700 text-xl font-medium animate-fade-in-smooth" style={{ animationDelay: '0.2s' }}>
          Your space. Your feelings. Your journey!
        </p>
        <div className="mt-8 flex justify-center animate-fade-in-smooth" style={{ animationDelay: '0.4s' }}>
          <div className="loading-spinner h-10 w-10"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;