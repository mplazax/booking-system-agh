// src/components/PrivateRoute.js
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../App";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "./Navbar";

const PrivateRoute = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    // Wyświetl spinner ładowania na środku ekranu, aby było jasne, że aplikacja pracuje
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Użytkownik nie jest zalogowany po sprawdzeniu, przekieruj do logowania
    return <Navigate to="/login" replace />;
  }

  // Użytkownik jest zalogowany, renderuj layout z nawigacją i treścią strony (Outlet)
  return (
    <>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: "64px" }}>
        <Outlet />
      </Box>
    </>
  );
};

export default PrivateRoute;
