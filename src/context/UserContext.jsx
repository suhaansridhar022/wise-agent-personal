// src/context/UserContext.jsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [email, setEmailState] = useState(null);
  const router = useRouter();

  // hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("app:user:email");
      if (stored) setEmailState(stored);
    } catch {
      // ignore
    }
  }, []);

  const setEmail = (value) => {
    setEmailState(value);
    try {
      if (value) window.localStorage.setItem("app:user:email", value);
      else window.localStorage.removeItem("app:user:email");
    } catch {
      // ignore
    }
  };

  const signOut = () => {
    setEmail(null);
    router.push("/login");
  };

  return (
    <UserContext.Provider value={{ email, setEmail, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};