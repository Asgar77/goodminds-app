import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-goodmind-gradient flex items-center justify-center z-50 transition-all duration-500">
      <div className="text-center animate-scale-in-smooth">
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-400 rounded-full animate-pulse-soft"></div>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <img
              src="/GoodMind new logo (13).png"
              alt="GoodMind Logo"
              className="w-20 h-20 object-contain animate-float-gentle"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-20 h-20 flex items-center justify-center';
                fallback.innerHTML = '<span class="text-4xl">🧠</span>';
                e.currentTarget.parentNode?.appendChild(fallback);
              }}
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-goodmind-gradient mb-2 animate-fade-in-smooth">
          goodmind.app
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-fade-in-smooth" style={{ animationDelay: '0.2s' }}>
          Your Digital Mental Wellness Sanctuary
        </p>
        <div className="mt-6 flex justify-center animate-fade-in-smooth" style={{ animationDelay: '0.4s' }}>
          <div className="loading-spinner h-8 w-8"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;