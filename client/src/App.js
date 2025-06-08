import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NavBar from "./components/NavBar";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ToastContext";

function AppWrapper() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

function App() {
  const location = useLocation();
  const publicPaths = ["/", "/login", "/register"];
  const hideNavBar = publicPaths.includes(location.pathname);

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
