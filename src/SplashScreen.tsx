import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      transition: 'opacity 0.5s',
    }}>
      <img
        src="/logo-splash.png"
        alt="App Logo"
        style={{ width: 180, height: 180, objectFit: 'contain' }}
      />
    </div>
  );
};

export default SplashScreen; 