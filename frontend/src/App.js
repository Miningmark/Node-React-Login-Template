import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Login from "pages/authentication/Login";
import Register from "pages/authentication/Register";
import AccountActivating from "pages/authentication/AccountActivating";
import Dashboard from "pages/Dashboard";
import ServerLogPage from "pages/admin/Serverlog";
import PermissionMatrixPage from "pages/admin/PermissionMatrix";
import UserNotificationsPage from "pages/admin/UserNotifications";
import UsersPage from "pages/userManagement/UsersPage";
import PermissionsPage from "pages/userManagement/Permissions";
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
import { useContext, useEffect, useState } from "react";

import useAxiosProtected from "hook/useAxiosProtected";
import { SocketProvider, SocketContext } from "contexts/SocketProvider";

//Zustand Store
import { useSettingsStore } from "hook/store/settingsStore";
import UserNotificationModal from "components/util/UserNotificationModal";

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
  const [notifications, setNotifications] = useState([]);
  const { setUsername, setRouteGroups, username, accessToken, logout, setAvatar } =
    useContext(AuthContext);
  const { setTheme } = useContext(ThemeContext);

  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const axiosProtected = useAxiosProtected();

  const setMenuFixed = useSettingsStore((state) => state.setMenuFixed);

  console.log("notifications", notifications);

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
        } else if (Object.prototype.hasOwnProperty.call(data, "avatar")) {
          setAvatar(null);
        } else {
          console.log("Kein Releventen Daten enthalten.");
        }
      }

      function handleNewUserNotification(data) {
        setNotifications((prev) => [data, ...prev]);
      }

      socket.on("user:update", handleUserUpdate);
      socket.on("global:notifications:create", handleNewUserNotification);
      socket.on("global:notifications:update", handleNewUserNotification);

      return () => {
        socket.off("user:update", handleUserUpdate);
        socket.off("global:notifications:create", handleNewUserNotification);
        socket.off("global:notifications:update", handleNewUserNotification);
      };
    }
  }, [socket, setUsername, setRouteGroups, logout, navigate, setAvatar]);

  useEffect(() => {
    if (!accessToken) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    async function fetchNotifications() {
      try {
        const notificationsRes = await axiosProtected.get("/user/getPendingNotifications", {
          signal,
        });
        if (isMounted) {
          if (notificationsRes.data?.pendingNotifications) {
            setNotifications(notificationsRes.data.pendingNotifications);
          }
        }
      } catch (error) {
        if (error.name === "CanceledError") {
        } else {
          console.warn("Kein gültiger Login gefunden.");
        }
      }
    }

    fetchNotifications();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [accessToken, axiosProtected]);

  useEffect(() => {
    if (!accessToken) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    async function fetchUser() {
      try {
        const [userRes, routesRes, avatarRes, settingsRes] = await Promise.all([
          axiosProtected.get("/user/getUsername", { signal }),
          axiosProtected.get("/user/getRouteGroups", { signal }),
          axiosProtected.get("/user/getAvatar", { signal, responseType: "blob" }),
          axiosProtected.get("/user/getSettings", { signal }),
        ]);

        if (isMounted) {
          if (userRes.data?.username) setUsername(userRes.data.username);
          if (routesRes.data?.routeGroups) setRouteGroups(routesRes.data.routeGroups);
          if (avatarRes.status === 200 && avatarRes.data) {
            // Blob → ObjectURL → img.src
            const avatarUrl = URL.createObjectURL(avatarRes.data);
            setAvatar(avatarUrl);
          }
          if (settingsRes.data) setMenuFixed(settingsRes.data.settings.isSideMenuFixed || false);
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
  }, [
    accessToken,
    username,
    setUsername,
    setRouteGroups,
    axiosProtected,
    setTheme,
    setAvatar,
    setMenuFixed,
  ]);

  function notificationRead(notificationId) {
    setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
  }

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
              <RequireAuth
                allowedRouteGroups={["adminPageNotificationsRead", "adminPageNotificationsWrite"]}
              >
                <UserNotificationsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/usermanagement/users"
            element={
              <RequireAuth allowedRouteGroups={["userManagementRead", "userManagementWrite"]}>
                <UsersPage />
              </RequireAuth>
            }
          />

          <Route
            path="/usermanagement/permissions"
            element={
              <RequireAuth allowedRouteGroups={["userManagementRead", "userManagementWrite"]}>
                <PermissionsPage />
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

      {notifications.map((item, index) => (
        <>
          <UserNotificationModal
            notification={item}
            key={index}
            notificationRead={notificationRead}
          />
        </>
      ))}
    </>
  );
}

export default AppWrapper;
