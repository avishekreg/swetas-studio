import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { UserService } from '../services/storeService';
import { UserProfile } from '../types';
import { CUSTOMER_ROLE, isPrivilegedRole } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
        const p = await UserService.getProfile(user.uid);
        
        if (!p) {
          const newProfile: Omit<UserProfile, 'createdAt'> = {
            uid: user.uid,
            email: user.email!,
            role: CUSTOMER_ROLE,
            favorites: [],
          };
          await UserService.syncProfile(newProfile);
          setProfile({ ...newProfile, createdAt: new Date() } as UserProfile);
        } else {
          setProfile(p);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const { signInWithGoogle } = await import('../firebase');
    await signInWithGoogle();
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    const { signInWithEmail } = await import('../firebase');
    await signInWithEmail(email, password);
  };

  const resetPassword = async (email: string) => {
    const { sendAdminPasswordReset } = await import('../firebase');
    await sendAdminPasswordReset(email);
  };

  const signOut = () => auth.signOut();

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isAdmin: isPrivilegedRole(profile?.role),
      isSuperAdmin: profile?.role === 'super_admin',
      loading, 
      signInWithGoogle,
      signInWithEmailPassword,
      resetPassword,
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
