import React, { useState, useContext } from "react";
import { UserContext } from "../App";
import { getCurrentUser, login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Container,
  Paper,
  Avatar,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const user = await getCurrentUser();
      setUser(user);
      navigate("/main");
    } catch (err) {
      setError("Nieprawidłowy email lub hasło. Spróbuj ponownie.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={6}
        sx={{
          marginTop: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
          <SchoolIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          System Rezerwacji Sal
        </Typography>
        <Typography
          component="p"
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Wydział Zarządzania AGH
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adres Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Hasło"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Zaloguj się
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
