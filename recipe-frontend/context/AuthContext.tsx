"use client";

import { createContext, useState, ReactNode, useEffect } from "react";

type AuthUser = {
  id: number;
  token: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    try {
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }

      if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Failed to parse stored user/token", err);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function login(userData: AuthUser, jwtToken: string) {
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}