'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { api } from '@/services/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.auth);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          setUser(parsed.user);
        } else {
          // Fallback if structure changes
          setUser(parsed);
        }
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.login({ email, password });
      
      const matchedUser: User = {
        id: response.user?.id || 'unknown',
        name: response.user?.name || 'User',
        email: response.user?.email || email,
        role: response.user?.role || 'EVALUATOR',
        department: response.user?.department || '',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: 'active' as const,
      };

      // We store the token and user inside STORAGE_KEYS.auth 
      // The `api.ts` file currently expects `auth-storage` but we'll adapt both
      const storeData = {
        token: response.token,
        user: matchedUser
      };
      
      localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(storeData));
      localStorage.setItem('auth-storage', JSON.stringify(storeData)); // Compatible with api.ts
      
      setUser(matchedUser);
      return matchedUser;
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.auth);
    localStorage.removeItem('auth-storage');
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
