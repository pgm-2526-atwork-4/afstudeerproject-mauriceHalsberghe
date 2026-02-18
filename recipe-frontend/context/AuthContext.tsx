"use client";

import { createContext, useState, ReactNode } from "react";

type AuthUser = {
  token: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(() => {
    
    if (typeof window === "undefined") return null;

    const stored = window.localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function logout() {
    window.localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
