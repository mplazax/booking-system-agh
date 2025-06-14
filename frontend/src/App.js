import React, { createContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import theme from "./theme";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import RoomsPage from "./pages/RoomsPage";
import UsersPage from "./pages/UsersPage";
import GroupsPage from "./pages/GroupsPage";
import CoursesPage from "./pages/CoursesPage";
import ProposalsPage from "./pages/ProposalsPage";
import ChangeRequestsPage from "./pages/ChangeRequestsPage";
import SingleRequestPage from "./pages/SingleRequestPage";
import {
  isAuthenticated,
  getCurrentUser,
  logout as authLogout,
} from "./services/authService";

export const UserContext = createContext(null);
export const ErrorContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          authLogout();
          setUser(null);
          console.error("Authentication check failed:", err);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleCloseError = () => setError("");
  const handleLogout = () => {
    authLogout();
    setUser(null);
  };

  const userContextValue = { user, setUser, loading, logout: handleLogout };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorContext.Provider value={setError}>
        <UserContext.Provider value={userContextValue}>
          <Router>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              <Route element={<PrivateRoute />}>
                <Route path="/main" element={<MainPage />} />
                <Route path="/requests" element={<ChangeRequestsPage />} />
                <Route
                  path="/request/:requestId"
                  element={<SingleRequestPage />}
                />
                <Route path="/proposals" element={<ProposalsPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/" element={<Navigate to="/main" replace />} />
              </Route>

              <Route
                path="*"
                element={
                  <Navigate
                    to={isAuthenticated() ? "/main" : "/login"}
                    replace
                  />
                }
              />
            </Routes>
          </Router>
          <Dialog open={!!error} onClose={handleCloseError}>
            <DialogTitle>Wystąpił Błąd</DialogTitle>
            <DialogContent>{error.toString()}</DialogContent>
            <DialogActions>
              <Button onClick={handleCloseError} variant="contained">
                Zamknij
              </Button>
            </DialogActions>
          </Dialog>
        </UserContext.Provider>
      </ErrorContext.Provider>
    </ThemeProvider>
  );
}

export default App;
