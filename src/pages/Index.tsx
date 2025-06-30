
import React, { useState } from 'react';
import Landing from '@/components/Landing';
import AuthModal from '@/components/AuthModal';
import EnhancedDashboard from '@/components/EnhancedDashboard';

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <EnhancedDashboard onLogout={handleLogout} />;
  }

  return (
    <>
      <Landing onGetStarted={handleGetStarted} />
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />
    </>
  );
};

export default Index;
