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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import theme from "./theme";

// Komponenty routingu
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// Strony
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import RoomsPage from "./pages/RoomsPage";
import UsersPage from "./pages/UsersPage";
import GroupsPage from "./pages/GroupsPage";
import CoursesPage from "./pages/CoursesPage";
import ProposalsPage from "./pages/ProposalsPage";
import ChangeRequestsPage from "./pages/ChangeRequestsPage";
import AvailabilityPage from "./pages/AvailabilityPage";

// Serwisy
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "./services/authService";

export const UserContext = createContext(null);
export const ErrorContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Kluczowy stan do zarządzania startem aplikacji

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          // Jeśli token jest nieprawidłowy (np. wygasł), wyloguj
          logout();
          setUser(null);
          console.error("Authentication check failed:", err);
        }
      }
      // Niezależnie od wyniku, kończymy ładowanie
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleCloseError = () => setError("");

  // Wartość przekazywana do kontekstu
  const userContextValue = { user, setUser, loading };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorContext.Provider value={setError}>
        <UserContext.Provider value={userContextValue}>
          <Router>
            <Routes>
              {/* Trasy publiczne (dostępne tylko dla niezalogowanych) */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              {/* Trasy prywatne (dostępne tylko dla zalogowanych) */}
              <Route element={<PrivateRoute />}>
                <Route path="/main" element={<MainPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/proposals" element={<ProposalsPage />} />
                <Route path="/requests" element={<ChangeRequestsPage />} />
                <Route path="/availability" element={<AvailabilityPage />} />

                {/* Domyślna trasa po zalogowaniu */}
                <Route path="/" element={<Navigate to="/main" replace />} />
              </Route>

              {/* Fallback dla wszystkich innych ścieżek */}
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
