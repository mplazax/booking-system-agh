import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { UserContext } from "../App";
import { apiRequest } from "../services/apiService";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import EventIcon from "@mui/icons-material/Event";

const MainPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [tasks, setTasks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const processTasks = useCallback(async () => {
    if (!user) return;
    try {
      const myRequests = await apiRequest(`/change_requests/my/${user.id}`);
      const allProposals = await apiRequest("/proposals");

      const generatedTasks = myRequests
        .map((req) => {
          const proposalsForRequest = allProposals.filter(
            (p) => p.change_request_id === req.id
          );
          const myProposal = proposalsForRequest.find(
            (p) => p.user_id === user.id
          );
          const otherPartyProposals = proposalsForRequest.filter(
            (p) => p.user_id !== user.id
          );

          if (req.status === "PENDING") {
            if (!myProposal) {
              return {
                id: req.id,
                text: `Wskaż swoją dostępność dla zgłoszenia #${req.id}`,
                cta: "Wskaż dostępność",
                path: `/request/${req.id}`,
              };
            }
            if (otherPartyProposals.length > 0) {
              return {
                id: req.id,
                text: `Sprawdź wspólne terminy dla zgłoszenia #${req.id}`,
                cta: "Zobacz zgłoszenie",
                path: `/request/${req.id}`,
              };
            }
            return {
              id: req.id,
              text: `Oczekiwanie na drugą stronę dla zgłoszenia #${req.id}`,
              cta: "Zobacz status",
              path: `/request/${req.id}`,
            };
          }
          return null;
        })
        .filter(Boolean);

      setTasks(generatedTasks);
    } catch (error) {
      console.error("Error processing tasks:", error);
    }
  }, [user]);

  const fetchUpcomingEvents = useCallback(async () => {
    if (!user?.group_id) return;
    try {
      const events = await apiRequest(`/courses/group/${user.group_id}/events`);
      const sortedEvents = events
        .map((e) => ({ ...e, date: new Date(e.day) }))
        .filter((e) => e.date >= new Date())
        .sort((a, b) => a.date - b.date)
        .slice(0, 3);
      setUpcomingEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    Promise.all([processTasks(), fetchUpcomingEvents()]).finally(() =>
      setLoading(false)
    );
  }, [processTasks, fetchUpcomingEvents]);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Witaj, {user?.name}!
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Twoje zadania
              </Typography>
              {tasks.length > 0 ? (
                <List>
                  {tasks.map((task) => (
                    <ListItem
                      key={task.id}
                      secondaryAction={
                        <Button
                          component={RouterLink}
                          to={task.path}
                          size="small"
                          variant="outlined"
                        >
                          {task.cta}
                        </Button>
                      }
                    >
                      <ListItemIcon>
                        <TaskAltIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={task.text} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Brak aktywnych zadań. Wszystko załatwione!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nadchodzące zajęcia
              </Typography>
              {upcomingEvents.length > 0 ? (
                <List dense>
                  {upcomingEvents.map((event) => (
                    <ListItem key={event.id}>
                      <ListItemIcon>
                        <EventIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Kurs ID: ${event.course_id}`}
                        secondary={new Date(event.day).toLocaleDateString(
                          "pl-PL"
                        )}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Brak nadchodzących zajęć.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Narzędzia
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/requests")}
                >
                  Otwórz Kalendarz
                </Button>
                {user && ["ADMIN", "KOORDYNATOR"].includes(user.role) && (
                  <Button onClick={() => navigate("/rooms")}>
                    Zarządzaj Salami
                  </Button>
                )}
                {user && ["ADMIN"].includes(user.role) && (
                  <Button onClick={() => navigate("/users")}>
                    Zarządzaj Użytkownikami
                  </Button>
                )}
                {user && ["ADMIN", "KOORDYNATOR"].includes(user.role) && (
                  <Button onClick={() => navigate("/groups")}>
                    Zarządzaj Grupami
                  </Button>
                )}
                {user &&
                  ["ADMIN", "KOORDYNATOR", "PROWADZACY"].includes(
                    user.role
                  ) && (
                    <Button onClick={() => navigate("/courses")}>
                      Zarządzaj Kursami
                    </Button>
                  )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainPage;
