import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50 transition-all duration-500">
      <div className="text-center animate-pulse-gentle">
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <img
            src="/GoodMind new logo (13).png"
            alt="GoodMind Logo"
            className="w-full h-full object-contain drop-shadow-2xl"
            onError={(e) => {
              // Fallback if logo doesn't load
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center';
              fallback.innerHTML = '<span class="text-4xl text-white">🧠</span>';
              e.currentTarget.parentNode?.appendChild(fallback);
            }}
          />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          GoodMind
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Your Digital Mental Wellness Sanctuary
        </p>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;