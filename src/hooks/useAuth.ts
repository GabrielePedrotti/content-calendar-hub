import { useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '@/types/auth';

const AUTH_STORAGE_KEY = 'planner_auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
    return { user: null, isAuthenticated: false };
  });

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = useCallback((email: string, password: string): boolean => {
    // Simple validation - your WebSocket server should handle real auth
    if (!email || !password) return false;
    
    const user: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
    };
    
    setAuthState({ user, isAuthenticated: true });
    return true;
  }, []);

  const logout = useCallback(() => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
  };
};
