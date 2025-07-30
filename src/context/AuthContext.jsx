import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, logout } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null); // use null to show loading state

  useEffect(() => {
    const token = getToken();
    setAuthenticated(!!token); // true if token exists, false otherwise
  }, []);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  if (authenticated === null) return null; // Optional: or show loading spinner

  return (
    <AuthContext.Provider
      value={{ authenticated, setAuthenticated, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
