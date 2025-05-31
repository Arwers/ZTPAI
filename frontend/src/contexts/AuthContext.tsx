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
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const response = await api.get("/api/auth/me/");
      setUser(response.data);
      return response.data;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      await api.post("/api/auth/login/", { username, password });
      await refreshUser();
    } catch (err) {
      setError("Invalid credentials. Try again.");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout/");
      setUser(null);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  // Check authentication status once on mount
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser, error }}>
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
