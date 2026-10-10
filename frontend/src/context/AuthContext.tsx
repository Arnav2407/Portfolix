import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'trader' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('portfolix_access_token');
      if (token) {
        try {
          const res = await api.get<User>('/auth/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('portfolix_access_token');
          localStorage.removeItem('portfolix_refresh_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login/json', { email, password });
    localStorage.setItem('portfolix_access_token', res.data.access_token);
    localStorage.setItem('portfolix_refresh_token', res.data.refresh_token);
    setUser(res.data.user);
  };

  const register = async (email: string, password: string, fullName?: string) => {
    await api.post('/auth/register', { email, password, full_name: fullName });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('portfolix_access_token');
    localStorage.removeItem('portfolix_refresh_token');
    setUser(null);
  };

  const quickDemoLogin = async (role: 'trader' | 'admin') => {
    const email = role === 'admin' ? 'admin@portfolix.com' : 'trader@portfolix.com';
    const pwd = role === 'admin' ? 'admin123!' : 'trader123!';
    await login(email, pwd);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
