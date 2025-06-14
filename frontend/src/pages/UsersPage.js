import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Container,
  Toolbar,
  Stack,
  Avatar,
  ListItemAvatar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import { apiRequest } from "../services/apiService";
import { UserContext } from "../App";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "PROWADZACY",
  });
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    apiRequest("/users")
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  };

  const handleOpen = () => {
    setFormData({ name: "", email: "", password: "", role: "PROWADZACY" });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    apiRequest("/users/create", {
      method: "POST",
      body: JSON.stringify(formData),
    })
      .then((newUser) => {
        setUsers((prev) => [...prev, newUser]);
        handleClose();
      })
      .catch((error) => {
        console.error("Error adding user:", error);
        alert(
          "Błąd podczas dodawania użytkownika. Sprawdź, czy email nie jest już zajęty."
        );
      });
  };

  const handleDelete = (userId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
      apiRequest(`/users/${userId}`, { method: "DELETE" })
        .then(() => {
          setUsers((prev) => prev.filter((user) => user.id !== userId));
        })
        .catch((error) => console.error("Error deleting user:", error));
    }
  };

  const roleTranslations = {
    ADMIN: "Administrator",
    KOORDYNATOR: "Koordynator",
    PROWADZACY: "Prowadzący",
    STAROSTA: "Starosta",
  };

  return (
    <Container maxWidth="md">
      <Paper>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Zarządzaj użytkownikami
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Dodaj użytkownika
          </Button>
        </Toolbar>
        <List>
          {users.map((user) => (
            <ListItem
              key={user.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(user.id)}
                  disabled={user.id === currentUser?.id}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${user.name} (${user.email})`}
                secondary={roleTranslations[user.role] || user.role}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj nowego użytkownika</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Imię i nazwisko"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Adres Email"
              name="email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Hasło"
              name="password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel id="role-select-label">Rola</InputLabel>
              <Select
                labelId="role-select-label"
                name="role"
                value={formData.role}
                label="Rola"
                onChange={handleChange}
              >
                <MenuItem value={"PROWADZACY"}>Prowadzący</MenuItem>
                <MenuItem value={"STAROSTA"}>Starosta</MenuItem>
                <MenuItem value={"KOORDYNATOR"}>Koordynator</MenuItem>
                <MenuItem value={"ADMIN"}>Administrator</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained">
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;
