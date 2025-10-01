// src/context/UserContext.jsx
"use client";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const router = useRouter();

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