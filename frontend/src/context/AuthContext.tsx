import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../services/api';
import { Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  loginAs: (role: Role) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('smartpark_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('smartpark_token');
      if (storedToken) {
        setAuthToken(storedToken);
        setTokenState(storedToken);
        try {
          const currentUser = await api.auth.getCurrentUser();
          setUser(currentUser);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setAuthToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await api.auth.register({ fullName, email, password });
    setAuthToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const loginAs = async (role: Role) => {
    if (role === 'ADMIN') {
      await login('admin@smartpark.com', 'Admin@123');
    } else if (role === 'OPERATOR') {
      await login('operator@smartpark.com', 'Operator@123');
    } else {
      await login('customer@smartpark.com', 'Customer@123');
    }
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginAs,
        logout,
        refreshUser,
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
