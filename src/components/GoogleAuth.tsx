import React, { useEffect, useState } from "react";
import { auth, provider, db } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Mail, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Custom hook to listen to Firestore user document
export function useUserData(uid: string | undefined) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(ref, (snap) => {
      setUserData(snap.exists() ? snap.data() : null);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user data:", error);
      setLoading(false);
    });
    
    return () => unsub();
  }, [uid]);
  
  return { userData, loading };
}

interface GoogleAuthProps {
  onAuthSuccess: () => void;
  onAuthError?: (error: string) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onAuthSuccess, onAuthError }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();

  // Listen to Firestore user data
  const { userData, loading: userDataLoading } = useUserData(user?.uid);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        try {
          // Save user data to Firestore
          const userRef = doc(db, "users", user.uid);
          await setDoc(
            userRef,
            {
              displayName: user.displayName || "",
              email: user.email || "",
              photoURL: user.photoURL || "",
              lastLogin: serverTimestamp(),
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
          
          toast({
            title: "Welcome to GoodMind!",
            description: `Hello ${user.displayName || user.email}! Your wellness journey continues.`,
          });
          
          onAuthSuccess();
        } catch (error) {
          console.error("Error saving user data:", error);
          onAuthError?.("Failed to save user data");
        }
      }
    });
    
    return () => unsubscribe();
  }, [onAuthSuccess, onAuthError, toast]);

  const handleSignIn = async () => {
    setAuthLoading(true);
    try {
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      console.log("Sign-in successful:", result.user);
    } catch (error: any) {
      console.error("Sign-in error:", error);
      const errorMessage = error.code === 'auth/popup-closed-by-user' 
        ? "Sign-in was cancelled" 
        : "Sign-in failed. Please try again.";
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      onAuthError?.(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
    } catch (error) {
      console.error("Sign-out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Listen to Firestore user data
  const { userData, loading: userDataLoading } = useUserData(user?.uid);

  if (user) {
    return (
      <Card className="glass border-0 max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-xl">Welcome back!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="font-medium text-gray-800">{user.displayName || "User"}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          
          {!userDataLoading && userData && (
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                Last login: {userData.lastLogin ? new Date(userData.lastLogin.toDate()).toLocaleDateString() : 'First time'}
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-0 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl">Continue Your Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleSignIn}
          disabled={authLoading}
          className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 py-6"
        >
          {authLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoogleAuth;