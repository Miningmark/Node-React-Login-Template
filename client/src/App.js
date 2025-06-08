import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import AccountActivating from "./pages/authentication/AccountActivating";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NavBar from "./components/NavBar";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ToastContext";
import ResetPassword from "./pages/authentication/ResetPassword";

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
  const publicPaths = ["/", "/login", "/register", "/reset-password", "/account-activation"];
  const hideNavBar = publicPaths.includes(location.pathname);

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account-activation" element={<AccountActivating />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
