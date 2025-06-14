import React, { useContext, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Container,
  Icon,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";

// Import ikon
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import RuleIcon from "@mui/icons-material/Rule";

const MainPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const features = [
    {
      title: "Kalendarz i Zgłoszenia",
      description: "Przeglądaj plan i zgłaszaj zmiany.",
      path: "/requests",
      icon: <EventAvailableIcon fontSize="large" color="primary" />,
      allowedRole: ["ADMIN", "KOORDYNATOR", "PROWADZACY", "STAROSTA"],
    },
    {
      title: "Dostępność",
      description: "Wskaż swoją dostępność dla zgłoszeń.",
      path: "/availability",
      icon: <RuleIcon fontSize="large" color="primary" />,
      allowedRole: ["ADMIN", "KOORDYNATOR", "PROWADZACY", "STAROSTA"],
    },
    {
      title: "Propozycje",
      description: "Przeglądaj propozycje terminów.",
      path: "/proposals",
      icon: <LibraryBooksIcon fontSize="large" color="primary" />,
      allowedRole: ["ADMIN", "KOORDYNATOR", "PROWADZACY", "STAROSTA"],
    },
    {
      title: "Sale",
      description: "Zarządzaj salami i ich dostępnością.",
      path: "/rooms",
      icon: <MeetingRoomIcon fontSize="large" color="primary" />,
      allowedRole: ["ADMIN", "KOORDYNATOR"],
    },
    {
      title: "Użytkownicy",
      description: "Zarządzaj kontami użytkowników.",
      path: "/users",
      icon: <PeopleIcon fontSize="large" color="primary" />,
      allowedRole: ["ADMIN"],
    },
    {
      title: "Grupy",
      description: "Zarządzaj grupami studenckimi.",
      path: "/groups",
      icon: <GroupIcon fontSize="large" color="primary" />,
      allowedRole: ["ADMIN", "KOORDYNATOR"],
    },
    {
      title: "Kursy",
      description: "Zarządzaj listą prowadzonych kursów.",
      path: "/courses",
      icon: <SchoolIcon fontSize="large" color="primary" />,
      allowedRole: ["ADMIN", "KOORDYNATOR", "PROWADZACY"],
    },
  ];

  const visibleFeatures = features.filter(
    (feature) => user && feature.allowedRole.includes(user.role)
  );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Witaj, {user?.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Wybierz jedną z dostępnych opcji, aby rozpocząć pracę z systemem.
      </Typography>
      <Grid container spacing={4}>
        {visibleFeatures.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <Card sx={{ height: "100%" }}>
              <CardActionArea
                onClick={() => navigate(feature.path)}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  p: 3,
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" component="div">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MainPage;
