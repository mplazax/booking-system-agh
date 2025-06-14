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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { apiRequest } from "../services/apiService";

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    capacity: "",
    equipment: "",
    type: "LECTURE_HALL",
  });
  const [editMode, setEditMode] = useState(false);
  const [searchText, setSearchText] = useState("");

  const roomTypeTranslations = {
    LECTURE_HALL: "Sala wykładowa",
    LABORATORY: "Laboratorium",
    SEMINAR_ROOM: "Sala seminaryjna",
    CONFERENCE_ROOM: "Sala konferencyjna",
    OTHER: "Inne",
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    apiRequest("/rooms")
      .then((data) => setRooms(data))
      .catch(console.error);
  };

  const handleOpen = (room = null) => {
    if (room) {
      setFormData({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        equipment: room.equipment || "",
        type: room.type,
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        name: "",
        capacity: "",
        equipment: "",
        type: "LECTURE_HALL",
      });
      setEditMode(false);
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      capacity: parseInt(formData.capacity, 10),
    };

    const request = editMode
      ? apiRequest(`/rooms/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : apiRequest("/rooms", { method: "POST", body: JSON.stringify(payload) });

    request
      .then(() => {
        fetchRooms();
        handleClose();
      })
      .catch((error) => alert(`Błąd: ${error.message}`));
  };

  const handleDelete = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę salę?")) {
      apiRequest(`/rooms/${id}`, { method: "DELETE" })
        .then(fetchRooms)
        .catch(console.error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Nazwa Sali",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <MeetingRoomIcon sx={{ mr: 1, color: "text.secondary" }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: "type",
      headerName: "Typ",
      width: 180,
      renderCell: (params) => (
        <span>{roomTypeTranslations[params.value] || params.value}</span>
      ),
    },
    { field: "capacity", headerName: "Pojemność", type: "number", width: 120 },
    { field: "equipment", headerName: "Wyposażenie", flex: 1 },
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

  const filteredRows = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (room.equipment &&
        room.equipment.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <Container maxWidth="lg">
      <Paper>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Szukaj po nazwie lub wyposażeniu..."
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
            Dodaj Salę
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
          {editMode ? "Edytuj salę" : "Dodaj nową salę"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Nazwa"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Pojemność"
              name="capacity"
              type="number"
              fullWidth
              value={formData.capacity}
              onChange={handleChange}
              required
            />
            <TextField
              label="Wyposażenie"
              name="equipment"
              fullWidth
              value={formData.equipment}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel>Typ Sali</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Typ Sali"
                onChange={handleChange}
              >
                {Object.entries(roomTypeTranslations).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
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

export default RoomsPage;
