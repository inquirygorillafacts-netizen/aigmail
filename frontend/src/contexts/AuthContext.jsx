import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged, signInWithGoogle, logOut, createOrUpdateUser, getUserData, checkOwnerExists, claimOwnerRole, updateUserProfile } from '@/lib/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerExists, setOwnerExists] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Get or create user data
        const data = await createOrUpdateUser(firebaseUser);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    // Check if owner exists
    checkOwnerExists().then(exists => setOwnerExists(exists));

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      const data = await createOrUpdateUser(firebaseUser);
      setUserData(data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logOut();
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const claimOwner = async () => {
    if (!user) return false;
    try {
      await claimOwnerRole(user.uid);
      const updatedData = await getUserData(user.uid);
      setUserData(updatedData);
      setOwnerExists(true);
      return true;
    } catch (error) {
      console.error('Claim owner error:', error);
      return false;
    }
  };

  const updateProfile = async (data) => {
    if (!user) return false;
    try {
      await updateUserProfile(user.uid, data);
      const updatedData = await getUserData(user.uid);
      setUserData(updatedData);
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const isCustomer = userData?.roles?.includes('customer');
  const isOwner = userData?.roles?.includes('owner');

  const value = {
    user,
    userData,
    loading,
    login,
    logout,
    claimOwner,
    updateProfile,
    isCustomer,
    isOwner,
    ownerExists,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
