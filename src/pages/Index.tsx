import React, { useState, useEffect } from 'react';
import Landing from '@/components/Landing';
import Dashboard from '@/components/Dashboard';
import GoogleAuth from '@/components/GoogleAuth';
import SplashScreen from '@/components/SplashScreen';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Handle splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Show splash for 3 seconds
    return () => clearTimeout(timer);
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
      
      if (user && !showSplash) {
        setShowAuth(false);
      }
    });

    return () => unsubscribe();
  }, [showSplash]);

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setIsAuthenticated(true);
    toast({
      title: "Welcome to GoodMind!",
      description: "Your wellness journey begins now.",
    });
  };

  const handleAuthError = (error: string) => {
    toast({
      title: "Authentication Error",
      description: error,
      variant: "destructive",
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAuth(false);
    toast({
      title: "Signed Out",
      description: "Take care! We'll be here when you're ready to continue your wellness journey.",
    });
  };

  // Show splash screen
  if (showSplash) {
    return <SplashScreen />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your wellness sanctuary...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if authenticated
  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  // Show authentication modal
  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="w-full max-w-md">
          <GoogleAuth 
            onAuthSuccess={handleAuthSuccess}
            onAuthError={handleAuthError}
          />
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAuth(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
            >
              ← Back to landing page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page
  return <Landing onGetStarted={handleGetStarted} />;
};

export default Index;