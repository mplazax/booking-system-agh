import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Button,
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import { apiRequest } from "../services/apiService";
import { UserContext } from "../App";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "PROWADZACY",
  });
  const [editMode, setEditMode] = useState(false);
  const { user: currentUser } = useContext(UserContext);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    apiRequest("/users")
      .then((data) => setUsers(data))
      .catch(console.error);
  };

  const handleOpen = (user = null) => {
    setError("");
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: "",
        role: user.role,
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        name: "",
        surname: "",
        email: "",
        password: "",
        role: "PROWADZACY",
      });
      setEditMode(false);
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    setError("");
    const payload = { ...formData };
    if (!payload.password) {
      delete payload.password;
    }

    const request = editMode
      ? apiRequest(`/users/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : apiRequest("/users/create", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    request
      .then(() => {
        fetchUsers();
        handleClose();
      })
      .catch((error) => {
        setError(error.message || "Wystąpił nieznany błąd.");
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
      apiRequest(`/users/${id}`, { method: "DELETE" })
        .then(fetchUsers)
        .catch(console.error);
    }
  };

  const roleTranslations = {
    ADMIN: "Administrator",
    KOORDYNATOR: "Koordynator",
    PROWADZACY: "Prowadzący",
    STAROSTA: "Starosta",
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "avatar",
      headerName: "Avatar",
      width: 70,
      renderCell: (params) => (
        <Avatar>
          <PersonIcon />
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    { field: "name", headerName: "Imię", width: 150 },
    { field: "surname", headerName: "Nazwisko", width: 150 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "role",
      headerName: "Rola",
      width: 150,
      valueGetter: (value) => roleTranslations[value] || value,
    },
    {
      field: "actions",
      headerName: "Akcje",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => handleOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
            disabled={params.row.id === currentUser?.id}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredRows = users.filter((user) => {
    const search = searchText.toLowerCase();
    return (
      (user.name?.toLowerCase() || "").includes(search) ||
      (user.surname?.toLowerCase() || "").includes(search) ||
      (user.email?.toLowerCase() || "").includes(search)
    );
  });

  return (
    <Container maxWidth="lg">
      <Paper>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Szukaj po imieniu, nazwisku, emailu..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 350 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Dodaj użytkownika
          </Button>
        </Toolbar>
        <Box sx={{ height: "70vh", width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? "Edytuj użytkownika" : "Dodaj nowego użytkownika"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Imię"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Nazwisko"
              name="surname"
              fullWidth
              value={formData.surname}
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
              required={!editMode}
              helperText={
                editMode ? "Pozostaw puste, aby nie zmieniać hasła" : ""
              }
            />
            <FormControl fullWidth>
              <InputLabel>Rola</InputLabel>
              <Select
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
            {editMode ? "Zapisz zmiany" : "Dodaj"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;
