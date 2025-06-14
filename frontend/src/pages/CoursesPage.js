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
import SchoolIcon from "@mui/icons-material/School";
import { apiRequest } from "../services/apiService";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    teacher_id: "",
    group_id: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchCourses = () =>
    apiRequest("/courses").then(setCourses).catch(console.error);
  const fetchUsers = () =>
    apiRequest("/users").then(setUsers).catch(console.error);
  const fetchGroups = () =>
    apiRequest("/groups").then(setGroups).catch(console.error);

  const handleOpen = (course = null) => {
    if (course) {
      setFormData({
        id: course.id,
        name: course.name,
        teacher_id: course.teacher_id,
        group_id: course.group_id,
      });
      setEditMode(true);
    } else {
      setFormData({ id: null, name: "", teacher_id: "", group_id: "" });
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
      teacher_id: parseInt(formData.teacher_id, 10),
      group_id: parseInt(formData.group_id, 10),
    };

    const request = editMode
      ? apiRequest(`/courses/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : apiRequest("/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    request
      .then(() => {
        fetchCourses();
        handleClose();
      })
      .catch((error) => alert(`Błąd: ${error.message}`));
  };

  const handleDelete = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten kurs?")) {
      apiRequest(`/courses/${id}`, { method: "DELETE" })
        .then(fetchCourses)
        .catch(console.error);
    }
  };

  const getUserNameById = (id) =>
    users.find((u) => u.id === id)?.name || "Nieznany";
  const getGroupNameById = (id) =>
    groups.find((g) => g.id === id)?.name || "Nieznana";

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Nazwa Kursu",
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SchoolIcon sx={{ mr: 1, color: "text.secondary" }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: "teacher_id",
      headerName: "Prowadzący",
      flex: 1,
      valueGetter: (value) => getUserNameById(value),
    },
    {
      field: "group_id",
      headerName: "Grupa",
      flex: 1,
      valueGetter: (value) => getGroupNameById(value),
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

  const filteredRows = courses.filter((course) =>
    course.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const teachers = users.filter((user) => user.role === "PROWADZACY");

  return (
    <Container maxWidth="lg">
      <Paper>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Szukaj po nazwie kursu..."
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
            Dodaj Kurs
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
          {editMode ? "Edytuj kurs" : "Dodaj nowy kurs"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Nazwa kursu"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              select
              label="Prowadzący"
              name="teacher_id"
              fullWidth
              value={formData.teacher_id}
              onChange={handleChange}
              required
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Grupa"
              name="group_id"
              fullWidth
              value={formData.group_id}
              onChange={handleChange}
              required
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
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

export default CoursesPage;
