import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Login from "pages/authentication/Login";
import Register from "pages/authentication/Register";
import AccountActivating from "pages/authentication/AccountActivating";
import Dashboard from "pages/Dashboard";
import ServerLogPage from "pages/admin/Serverlog";
import PermissionMatrixPage from "pages/admin/PermissionMatrix";
import UserNotificationsPage from "pages/admin/UserNotifications";
import UserPage from "pages/user/Page";
import UserSettings from "pages/user/Settings";
import NavBar from "components/menu/NavBar";
import { AuthProvider, AuthContext } from "contexts/AuthContext";
import { ToastProvider } from "components/ToastContext";
import ResetPassword from "pages/authentication/ResetPassword";
import NotFound from "pages/NotFound";
import Unauthorized from "pages/Unauthorized";
import { ThemeProvider, ThemeContext } from "contexts/ThemeContext";
import RequireAuth from "components/RequireAuth";
import PublicRoute from "components/PublicRoute";
import { useContext, useEffect } from "react";
import UserManagement from "pages/UserManagement";
import useAxiosProtected from "hook/useAxiosProtected";
import { SocketProvider, SocketContext } from "contexts/SocketProvider";

function AppWrapper() {
  return (
    <AuthProvider>
      <InnerProviders />
    </AuthProvider>
  );
}

function InnerProviders() {
  const { accessToken } = useContext(AuthContext);

  return (
    <SocketProvider accessToken={accessToken}>
      <ToastProvider>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </ToastProvider>
    </SocketProvider>
  );
}

function App() {
  const { setUsername, setRouteGroups, username, accessToken, logout } = useContext(AuthContext);
  const { setTheme } = useContext(ThemeContext);

  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      function handleUserUpdate(data) {
        if (Object.prototype.hasOwnProperty.call(data, "username")) {
          setUsername(data.username);
        } else if (Object.prototype.hasOwnProperty.call(data, "routeGroups")) {
          setRouteGroups(data.routeGroups);
        } else if (
          Object.prototype.hasOwnProperty.call(data, "isActive") ||
          Object.prototype.hasOwnProperty.call(data, "isDisabled")
        ) {
          logout();
          navigate("/login");
        } else {
          console.log("Kein Releventen Daten enthalten.");
        }
      }

      socket.on("user:update", handleUserUpdate);

      return () => {
        socket.off("user:update", handleUserUpdate);
      };
    }
  }, [socket, setUsername, setRouteGroups, logout, navigate]);

  const axiosProtected = useAxiosProtected();

  useEffect(() => {
    if (!accessToken) return;
    //if (username && routeGroups) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    async function fetchUser() {
      try {
        const [userRes, routesRes] = await Promise.all([
          axiosProtected.get("/user/getUsername", { signal }),
          axiosProtected.get("/user/getRouteGroups", { signal }),
        ]);

        if (isMounted) {
          if (userRes.data?.username) setUsername(userRes.data.username);
          if (routesRes.data?.routeGroups) setRouteGroups(routesRes.data.routeGroups);
        }
      } catch (err) {
        if (err.name === "CanceledError") {
        } else {
          console.warn("Kein gültiger Login gefunden.");
        }
      }
    }

    async function fetchSettings() {
      try {
        const responseSettings = await axiosProtected.get("/user/getSettings");
        setTheme(responseSettings.data.settings.theme === "dark_theme" ? "dark" : "light");
      } catch (error) {
        console.warn("Fehler beim Laden der Einstellungen:", error);
      }
    }

    if (!username) {
      fetchUser();
    }

    fetchSettings();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [accessToken, username, setUsername, setRouteGroups, axiosProtected, setTheme]);

  return (
    <>
      <NavBar>
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
          {process.env.REACT_APP_REGISTER_ACTIVE === "true" ? (
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
          ) : null}

          {/* Authentifizierte Routen */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth allowedRouteGroups={[]}>
                <Dashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/admin/server-log"
            element={
              <RequireAuth allowedRouteGroups={["adminPageServerLogRead"]}>
                <ServerLogPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin/permissionmatrix"
            element={
              <RequireAuth
                allowedRouteGroups={["adminPagePermissionsRead", "adminPagePermissionsWrite"]}
              >
                <PermissionMatrixPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin/user-notifications"
            element={
              <RequireAuth allowedRouteGroups={[]}>
                <UserNotificationsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/usermanagement"
            element={
              <RequireAuth allowedRouteGroups={["userManagementRead", "userManagementWrite"]}>
                <UserManagement />
              </RequireAuth>
            }
          />

          <Route
            path="/user/page"
            element={
              <RequireAuth allowedRouteGroups={[]}>
                <UserPage />
              </RequireAuth>
            }
          />
          <Route
            path="/user/settings"
            element={
              <RequireAuth allowedRouteGroups={[]}>
                <UserSettings />
              </RequireAuth>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </NavBar>
    </>
  );
}

export default AppWrapper;
