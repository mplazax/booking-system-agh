// Przykład dla src/pages/AvailabilityPage.js
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import { apiRequest } from "../services/apiService";

const AvailabilityPage = () => {
  const [formData, setFormData] = useState({
    change_request_id: "",
    start_date: "",
    end_date: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await apiRequest("/proposals", {
        method: "POST",
        body: JSON.stringify({
          change_request_id: parseInt(formData.change_request_id, 10),
          interval: {
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
          },
        }),
      });
      setMessage("Twoja dostępność została pomyślnie zgłoszona.");
      setFormData({ change_request_id: "", start_date: "", end_date: "" });
    } catch (error) {
      console.error("Błąd podczas zgłaszania dostępności:", error);
      setMessage(`Wystąpił błąd: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Wskaż swoją dostępność
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Jeśli otrzymałeś zgłoszenie zmiany terminu, możesz tutaj wskazać
          przedziały czasowe, które Ci odpowiadają.
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="ID Zgłoszenia Zmiany"
              name="change_request_id"
              type="number"
              value={formData.change_request_id}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Dostępny od"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Dostępny do"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {message && (
              <Alert
                severity={
                  message.startsWith("Wystąpił błąd") ? "error" : "success"
                }
              >
                {message}
              </Alert>
            )}
            <Button type="submit" variant="contained" size="large">
              Wyślij propozycję terminu
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default AvailabilityPage;
