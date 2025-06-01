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
      console.log("Attempting login for user:", username);
      
      // First try to login
      const loginResponse = await api.post("/api/auth/login/", {
        username,
        password,
      });
      
      console.log("Login response received:", loginResponse.status);
      
      if (loginResponse.status === 200) {
        // Store token in localStorage if it's in the response
        if (loginResponse.data?.access_token) {
          localStorage.setItem('access_token', loginResponse.data.access_token);
          console.log('Token stored in localStorage');
        }
        
        // Add a small delay to ensure cookies are set properly
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // If login was successful, get user data
        const userData = await checkAuthOnly();
        console.log("User data after login:", userData);
        
        if (userData) {
          setUser(userData);
          return userData;
        } else {
          console.error("Login succeeded but user data is null");
          throw new Error("Failed to get user info after login");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
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

  // Update auth check effect to be more reliable
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const currentPath = window.location.pathname;
      
      // Skip auth check on login/register pages
      if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Checking authentication for path:', currentPath);
        const userData = await checkAuthOnly();
        
        // Only update state if component is still mounted
        if (isMounted) {
          console.log('Authentication check result:', userData ? 'Authenticated' : 'Not authenticated');
          setUser(userData);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Auth check error:', err);
          setUser(null);
          setIsLoading(false);
        }
      }
    };
    
    initAuth();
    
    // Cleanup function to prevent updates after unmount
    return () => {
      isMounted = false;
    };
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
