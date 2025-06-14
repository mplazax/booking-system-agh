import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../App";
import { Box, CircularProgress } from "@mui/material";

const PublicRoute = () => {
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

  if (user) {
    return <Navigate to="/main" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
