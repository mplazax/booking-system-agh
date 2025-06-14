import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import { apiRequest } from "../services/apiService";
import { UserContext } from "../App";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const steps = [
  "Zgłoszenie",
  "Wskazywanie dostępności",
  "Akceptacja terminu",
  "Zakończone",
];
const timeSlotMap = {
  1: "8:00-9:30",
  2: "9:45-11:15",
  3: "11:30-13:00",
  4: "13:15-14:45",
  5: "15:00-16:30",
  6: "16:45-18:15",
  7: "18:30-20:00",
};

const SingleRequestPage = () => {
  const { requestId } = useParams();
  const { user } = useContext(UserContext);
  const [request, setRequest] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [commonSlots, setCommonSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myAvailability, setMyAvailability] = useState({
    day: "",
    time_slot_id: "",
  });

  const fetchRequestData = useCallback(async () => {
    setLoading(true);
    try {
      const reqData = await apiRequest(
        `/change_requests/${requestId}?request_id=${requestId}`
      );
      const propData = await apiRequest(`/proposals/${requestId}`);
      setRequest(reqData);
      setProposals(propData || []);
    } catch (error) {
      console.error("Error fetching request data:", error);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequestData();
  }, [fetchRequestData]);

  useEffect(() => {
    if (proposals.length > 0 && user) {
      const myProposals = proposals.filter((p) => p.user_id === user.id);
      const otherProposals = proposals.filter((p) => p.user_id !== user.id);
      const common = [];
      myProposals.forEach((myP) => {
        otherProposals.forEach((otherP) => {
          if (
            myP.day === otherP.day &&
            myP.time_slot_id === otherP.time_slot_id
          ) {
            common.push(myP);
          }
        });
      });
      setCommonSlots(common);
    }
  }, [proposals, user]);

  const handleAddAvailability = async () => {
    if (!myAvailability.day || !myAvailability.time_slot_id) {
      alert("Proszę wybrać dzień i slot czasowy.");
      return;
    }
    try {
      await apiRequest("/proposals", {
        method: "POST",
        body: JSON.stringify({
          change_request_id: parseInt(requestId),
          user_id: user.id,
          day: myAvailability.day,
          time_slot_id: parseInt(myAvailability.time_slot_id),
        }),
      });
      alert("Dostępność dodana!");
      fetchRequestData();
    } catch (e) {
      alert("Błąd: " + e.message);
    }
  };

  if (loading)
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  if (!request) return <Typography>Nie znaleziono zgłoszenia.</Typography>;

  const mySubmittedProposals = proposals.filter((p) => p.user_id === user?.id);

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" gutterBottom>
          Szczegóły zgłoszenia #{request.id || requestId}
        </Typography>
        <Stepper activeStep={1} alternativeLabel sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <div>
                <Typography variant="h6">Moje propozycje</Typography>
                {mySubmittedProposals.length > 0 ? (
                  <List dense>
                    {mySubmittedProposals.map((p) => (
                      <ListItem key={p.id}>
                        <ListItemText
                          primary={format(new Date(p.day), "d MMMM yyyy", {
                            locale: pl,
                          })}
                          secondary={`Slot: ${timeSlotMap[p.time_slot_id]}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Nie wskazałeś jeszcze dostępności.
                  </Typography>
                )}
              </div>
              <Box component="form" noValidate>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Dodaj nową dostępność:
                </Typography>
                <TextField
                  type="date"
                  name="day"
                  fullWidth
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    setMyAvailability({
                      ...myAvailability,
                      day: e.target.value,
                    })
                  }
                />
                <TextField
                  select
                  label="Slot czasowy"
                  name="time_slot_id"
                  fullWidth
                  defaultValue=""
                  onChange={(e) =>
                    setMyAvailability({
                      ...myAvailability,
                      time_slot_id: e.target.value,
                    })
                  }
                >
                  {Object.entries(timeSlotMap).map(([id, time]) => (
                    <MenuItem key={id} value={id}>
                      {time}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={handleAddAvailability}
                >
                  Dodaj
                </Button>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Wspólne terminy</Typography>
            {commonSlots.length > 0 ? (
              <List>
                {commonSlots.map((p) => (
                  <ListItem
                    key={`common-${p.id}`}
                    secondaryAction={
                      <Button variant="contained" size="small">
                        Akceptuj
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={format(new Date(p.day), "d MMMM yyyy", {
                        locale: pl,
                      })}
                      secondary={`Slot: ${timeSlotMap[p.time_slot_id]}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Brak wspólnych terminów do akceptacji.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SingleRequestPage;
