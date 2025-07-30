// src/layouts/MainLayout.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const MainLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="p-4">
      <header className="mb-4 border-b pb-2">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;