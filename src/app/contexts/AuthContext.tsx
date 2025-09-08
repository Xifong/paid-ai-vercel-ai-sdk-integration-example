'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { userStore } from '../userStore';
import { LoginFormData, UserData } from '../types';

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  signup: (userData: UserData) => Promise<void>;
  login: (userData: LoginFormData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const setLoginState = useCallback(() => {
    console.log('[AUTH] B1. setLoginState called');
    const user = userStore.getCurrentUser();
    console.log('[AUTH] B2. Current user from store:', user);
    
    if (!user) {
      console.log('[AUTH] B3. No user found, setting logged out state');
      setIsLoggedIn(false)
      setUserData(null);
      return;
    }

    console.log('[AUTH] B4. User found, setting logged in state');
    setIsLoggedIn(true);
    const userData = userStore.userToUserData(user);
    console.log('[AUTH] B5. UserData converted:', userData);
    setUserData(userData);
    console.log('[AUTH] B6. Login state update complete');
  }, [setIsLoggedIn, setUserData, userStore])

  useEffect(() => {
    setLoginState();
  }, []);

  const signup = async (userData: UserData) => {
    console.log('[AUTH] A1. Signup started', { email: userData.email, name: userData.name });
    
    try {
      console.log('[AUTH] A2. Creating user in store');
      const user = await userStore.createUser(userData.email, userData.name, userData.password);
      console.log('[AUTH] A3. User created', { userId: user.id });
      
      console.log('[AUTH] A4. Creating session');
      userStore.createSession(user.id);
      console.log('[AUTH] A5. Session created');
      
      console.log('[AUTH] A6. Setting login state');
      setLoginState();
      console.log('[AUTH] A7. Login state set');
    } catch (error) {
      console.error('[AUTH] ERROR in signup:', error);
      throw error;
    }
  };

  const login = async (userData: LoginFormData) => {
    const userAuth = await userStore.authenticateUser(userData.email, userData.password);
    if (!userAuth) return false;
    const user = userStore.getUserByEmail(userData.email);
    if (!user) return false;
    userStore.createSession(user.id);
    setLoginState();
    return true;
  }

  const logout = () => {
    const sessionToken = userStore.getCurrentSessionToken();
    if (!sessionToken) return;
    userStore.deleteSession(sessionToken);
    setLoginState();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userData, signup, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}
