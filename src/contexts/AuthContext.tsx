import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { UserService } from '../services/storeService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        let p = await UserService.getProfile(user.uid);
        const hardcodedAdmin = user.email === 'avishekreg@gmail.com';
        
        if (!p) {
          const newProfile: Omit<UserProfile, 'createdAt'> = {
            uid: user.uid,
            email: user.email!,
            role: hardcodedAdmin ? 'admin' : 'customer',
            favorites: [],
          };
          await UserService.syncProfile(newProfile);
          setProfile({ ...newProfile, createdAt: new Date() } as UserProfile);
        } else {
          // If profile exists but is for our admin email, ensure the role is correct in local state
          if (hardcodedAdmin && p.role !== 'admin') {
            p.role = 'admin';
            // Optionally sync back to DB: await UserService.updateRole(user.uid, 'admin');
          }
          setProfile(p);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const { signInWithGoogle } = await import('../firebase');
    await signInWithGoogle();
  };

  const signOut = () => auth.signOut();

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isAdmin: profile?.role === 'admin' || user?.email === 'avishekreg@gmail.com', 
      loading, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
