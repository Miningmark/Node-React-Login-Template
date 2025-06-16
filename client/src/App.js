import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import AccountActivating from "./pages/authentication/AccountActivating";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import NavBar from "./components/NavBar";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ToastContext";
import ResetPassword from "./pages/authentication/ResetPassword";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import { ThemeProvider } from "./contexts/ThemeContext";
import RequireAuth from "./components/RequireAuth";
import PublicRoute from "./components/PublicRoute";
import React, { useContext } from "react";
import UserManagement from "./pages/UserManagement";

function AppWrapper() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

function App() {
  const location = useLocation();
  const publicPaths = ["/", "/login", "/register", "/password-reset", "/account-activation"];
  const hideNavBar = publicPaths.includes(location.pathname);

  const { config } = useContext(AuthContext);

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        {/* Öffentlich, aber geschützt wenn bereits eingeloggt */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/password-reset"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/account-activation"
          element={
            <PublicRoute>
              <AccountActivating />
            </PublicRoute>
          }
        />

        {/* Nur anzeigen, wenn Registrierung aktiv ist */}
        {config.isRegisterEnable && (
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        )}

        {/* Authentifizierte Routen */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <AdminPage />
            </RequireAuth>
          }
        />

         <Route
          path="/usermanagement"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <UserManagement />
            </RequireAuth>
          }
        />

        <Route
          path="/userpage"
          element={
            <RequireAuth allowedRoles={["User"]}>
              <UserPage />
            </RequireAuth>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
