import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

interface AuthUser {
  username: string;
  user_id: number;
  is_staff: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  error: string | null;
  checkAuthOnly: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginInProgress, setLoginInProgress] = useState(false);
  
  // Improved checkAuthOnly to handle 401 properly without double requests
  const checkAuthOnly = async (): Promise<AuthUser | null> => {
    try {
      const response = await api.get('/api/auth/me/');
      return response.data;
    } catch (err: any) {
      // Don't try to refresh token here - let the interceptor handle it
      return null;
    }
  };

  // Add a refreshToken function that uses POST
  const refreshToken = async (): Promise<boolean> => {
    try {
      await api.post('/api/auth/refresh/');
      return true;
    } catch (err) {
      return false;
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const userData = await checkAuthOnly();
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);
    setLoginInProgress(true);
    
    try {
      // First try to login
      const loginResponse = await api.post("/api/auth/login/", {
        username,
        password,
      });
      
      if (loginResponse.status === 200) {
        // If login was successful, get user data
        const userData = await checkAuthOnly();
        if (userData) {
          setUser(userData);
          return userData;
        } else {
          throw new Error("Failed to get user info after login");
        }
      }
    } catch (err: any) {
      // Set error but don't cause redirect
      setError(err.response?.data?.detail || "Invalid username or password");
      throw err;
    } finally {
      setIsLoading(false);
      setLoginInProgress(false);
    }
    
    return null;
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout/");
      setUser(null);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  // Only check auth on initial load and avoid duplicate checks
  useEffect(() => {
    const initAuth = async () => {
      const currentPath = window.location.pathname;
      
      // Don't check auth during login process or on auth pages
      if (loginInProgress || currentPath === '/login' || currentPath === '/register') {
        setIsLoading(false);
        return;
      }

      // Check auth on protected pages or landing page
      try {
        const userData = await checkAuthOnly();
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [loginInProgress]); // Only depend on loginInProgress

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      refreshUser,
      refreshToken,
      error, 
      checkAuthOnly
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
