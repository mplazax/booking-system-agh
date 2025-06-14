import React, { useEffect, useState } from "react";
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
  IconButton,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import { apiRequest } from "../services/apiService";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    year: "",
    leader_id: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = () => {
    apiRequest("/groups")
      .then((data) => setGroups(data))
      .catch(console.error);
  };

  const fetchUsers = () => {
    apiRequest("/users")
      .then((data) => setUsers(data))
      .catch(console.error);
  };

  const handleOpen = (group = null) => {
    if (group) {
      setFormData({
        id: group.id,
        name: group.name,
        year: group.year,
        leader_id: group.leader_id,
      });
      setEditMode(true);
    } else {
      setFormData({ id: null, name: "", year: "", leader_id: "" });
      setEditMode(false);
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    const payload = {
      ...formData,
      year: parseInt(formData.year, 10),
      leader_id: parseInt(formData.leader_id, 10),
    };

    const request = editMode
      ? apiRequest(`/groups/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : apiRequest("/groups", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    request
      .then(() => {
        fetchGroups();
        handleClose();
      })
      .catch((error) => alert(`Błąd: ${error.message}`));
  };

  const handleDelete = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę grupę?")) {
      apiRequest(`/groups/${id}`, { method: "DELETE" })
        .then(fetchGroups)
        .catch(console.error);
    }
  };

  const getUserNameById = (id) =>
    users.find((u) => u.id === id)?.name || "Nieznany";

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Nazwa Grupy",
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <GroupIcon sx={{ mr: 1, color: "text.secondary" }} />
          {params.value}
        </Box>
      ),
    },
    { field: "year", headerName: "Rok", type: "number", width: 100 },
    {
      field: "leader_id",
      headerName: "Starosta",
      flex: 1,
      valueGetter: (value) => getUserNameById(value),
    },
    {
      field: "actions",
      headerName: "Akcje",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => handleOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredRows = groups.filter((group) =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const starostas = users.filter((user) => user.role === "STAROSTA");

  return (
    <Container maxWidth="lg">
      <Paper>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Szukaj po nazwie grupy..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 300 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Dodaj Grupę
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
          {editMode ? "Edytuj grupę" : "Dodaj nową grupę"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Nazwa grupy"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Rok studiów"
              name="year"
              type="number"
              fullWidth
              value={formData.year}
              onChange={handleChange}
              required
            />
            <TextField
              select
              label="Starosta"
              name="leader_id"
              fullWidth
              value={formData.leader_id}
              onChange={handleChange}
              required
            >
              {starostas.map((starosta) => (
                <MenuItem key={starosta.id} value={starosta.id}>
                  {starosta.name}
                </MenuItem>
              ))}
            </TextField>
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

export default GroupsPage;
