import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Container,
  Toolbar,
  TextField,
  IconButton,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiRequest } from "../services/apiService";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const timeSlotMap = {
  1: "8:00-9:30",
  2: "9:45-11:15",
  3: "11:30-13:00",
  4: "13:15-14:45",
  5: "15:00-16:30",
  6: "16:45-18:15",
  7: "18:30-20:00",
};

const ProposalsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [users, setUsers] = useState({}); // Użyjemy obiektu/mapy dla szybszego dostępu
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Pobieramy wszystkie propozycje i wszystkich użytkowników równolegle
      const [proposalsData, usersData] = await Promise.all([
        apiRequest("/proposals"),
        apiRequest("/users"),
      ]);

      setProposals(proposalsData || []);

      // Tworzymy mapę użytkowników dla łatwego dostępu: { 1: {id: 1, name: 'Jan'}, ... }
      const usersMap = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      setUsers(usersMap);
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Czy na pewno chcesz usunąć tę propozycję? Tej akcji nie można cofnąć."
      )
    ) {
      apiRequest(`/proposals/${id}`, { method: "DELETE" })
        .then(() => {
          // Po usunięciu odświeżamy dane
          fetchData();
        })
        .catch((error) => alert(`Błąd podczas usuwania: ${error.message}`));
    }
  };

  const columns = [
    { field: "id", headerName: "ID Propozycji", width: 120 },
    { field: "change_request_id", headerName: "ID Zgłoszenia", width: 120 },
    {
      field: "user_id",
      headerName: "Zaproponowane przez",
      flex: 1,
      // Pobieramy nazwę użytkownika z naszej mapy
      valueGetter: (value) => users[value]?.name || `Użytkownik ID: ${value}`,
    },
    {
      field: "day",
      headerName: "Dzień",
      width: 180,
      valueFormatter: (value) =>
        format(new Date(value), "EEEE, d MMMM yyyy", { locale: pl }),
    },
    {
      field: "time_slot_id",
      headerName: "Slot czasowy",
      width: 150,
      valueGetter: (value) => timeSlotMap[value] || "Nieznany",
    },
    {
      field: "actions",
      headerName: "Akcje",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
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

  const filteredRows = proposals.filter((proposal) => {
    const search = searchText.toLowerCase();
    const userName = (users[proposal.user_id]?.name || "").toLowerCase();
    return (
      userName.includes(search) ||
      String(proposal.change_request_id).includes(search)
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
              placeholder="Szukaj po nazwisku lub ID zgłoszenia..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 350 }}
            />
          </Box>
        </Toolbar>
        <Box sx={{ height: "70vh", width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default ProposalsPage;
