import React, { useEffect, useState } from "react";
import { auth, provider, db } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

// Custom hook to listen to Firestore user document
export function useUserData(uid: string | undefined) {
  const [userData, setUserData] = useState<any>(null);
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(ref, (snap) => {
      setUserData(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [uid]);
  return userData;
}

const GoogleAuth: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // Save user data to Firestore
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            displayName: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Sign-in failed!");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert("Sign-out failed!");
    }
  };

  if (loading) return <div>Loading...</div>;

  // Listen to Firestore user data
  const userData = useUserData(user?.uid);

  return (
    <div style={{ textAlign: "center", marginTop: 32 }}>
      {user ? (
        <div>
          <img src={user.photoURL || undefined} alt="User avatar" style={{ borderRadius: "50%", width: 64, height: 64 }} />
          <h2>Welcome, {user.displayName || user.email}!</h2>
          <p>{user.email}</p>
          <button onClick={handleSignOut} style={{ padding: "8px 16px", marginTop: 16 }}>Sign Out</button>
          <div style={{ marginTop: 24 }}>
            <h3>Your Firestore Data:</h3>
            <pre style={{ textAlign: "left", display: "inline-block" }}>{JSON.stringify(userData, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <button onClick={handleSignIn} style={{ padding: "8px 16px" }}>Sign in with Google</button>
      )}
    </div>
  );
};

export default GoogleAuth; 