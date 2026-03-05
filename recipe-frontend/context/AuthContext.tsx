"use client";

import { createContext, useState, ReactNode, useEffect } from "react";

type AuthUser = {
  id: number;
  token: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  dietId?: number;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, _setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    try {
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        _setUser(JSON.parse(storedUser));
      }

      if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Failed to parse stored user/token", err);
      _setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function login(userData: AuthUser, jwtToken: string) {
    _setUser(userData);
    setToken(jwtToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    _setUser(null);
    setToken(null);
  }

  function setUser(userData: AuthUser) {
    _setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}