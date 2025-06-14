import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../App";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "./Navbar";

const PrivateRoute = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
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
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: "64px" }}
      >
        <Outlet />
      </Box>
    </>
  );
};

export default PrivateRoute;
