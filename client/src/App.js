import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import AccountActivating from "./pages/authentication/AccountActivating";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import NavBar from "./components/menu/NavBar";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ToastContext";
import ResetPassword from "./pages/authentication/ResetPassword";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import { ThemeProvider } from "./contexts/ThemeContext";
import RequireAuth from "./components/RequireAuth";
import PublicRoute from "./components/PublicRoute";
import { useContext, useEffect } from "react";
import UserManagement from "./pages/UserManagement";
import useAxiosProtected from "./hook/useAxiosProtected";
import { SocketProvider, SocketContext } from "contexts/SocketProvider";
import { useNavigate } from "react-router-dom";

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
  const location = useLocation();
  const publicPaths = ["/", "/login", "/register", "/password-reset", "/account-activation"];
  const hideNavBar = publicPaths.includes(location.pathname);

  const { setUsername, setRouteGroups, username, routeGroups, accessToken, logout } =
    useContext(AuthContext);

  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      function handleUserUpdate(data) {
        if (Object.hasOwn(data, "username")) {
          setUsername(data.username);
        } else if (Object.hasOwn(data, "routeGroups")) {
          setRouteGroups(data.routeGroups);
        } else if (Object.hasOwn(data, "isActive") || Object.hasOwn(data, "isDisabled")) {
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
  }, [socket]);

  const axiosProtected = useAxiosProtected();

  useEffect(() => {
    if (!accessToken) return;
    if (username && routeGroups) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    const fetchUser = async () => {
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
    };

    if (!username) {
      fetchUser();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [accessToken]);

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
          path="/admin"
          element={
            <RequireAuth
              allowedRouteGroups={[
                "adminPageServerLogRead",
                "adminPagePermissionsRead",
                "adminPagePermissionsWrite",
              ]}
            >
              <AdminPage />
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
          path="/userpage"
          element={
            <RequireAuth allowedRouteGroups={[]}>
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
