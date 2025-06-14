import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Typography,
  Container,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { apiRequest } from "../services/apiService";
import { pl } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { pl: pl };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});
const availableViews = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];

const ChangeRequestsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(Views.MONTH);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const calendarFormats = {
    agendaHeaderFormat: ({ start, end }, culture, local) =>
      local.format(start, "d MMMM yyyy", { locale: pl }) +
      " — " +
      local.format(end, "d MMMM yyyy", { locale: pl }),
    agendaDateFormat: (date, culture, local) =>
      local.format(date, "EEEE, d MMMM", { locale: pl }),
  };

  const fetchAllEvents = useCallback(async () => {
    setLoading(true);
    try {
      const courses = await apiRequest("/courses");
      const allEventsPromises = courses.map(async (course) => {
        const eventsData = await apiRequest(`/courses/${course.id}/events`);
        return eventsData.map((event) => ({
          ...event,
          id: `${course.id}-${event.id}`,
          title: course.name,
          start: getSlotTimes(event.day, event.time_slot_id).start,
          end: getSlotTimes(event.day, event.time_slot_id).end,
          courseId: course.id,
        }));
      });
      const allEventsArrays = await Promise.all(allEventsPromises);
      setEvents(allEventsArrays.flat());
    } catch (error) {
      console.error("Błąd podczas pobierania wydarzeń:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  const getSlotTimes = (day, slot) => {
    const slotTimes = [
      { start: "08:00", end: "09:30" },
      { start: "09:45", end: "11:15" },
      { start: "11:30", end: "13:00" },
      { start: "13:15", end: "14:45" },
      { start: "15:00", end: "16:30" },
      { start: "16:45", end: "18:15" },
      { start: "18:30", end: "20:00" },
    ];
    const times = slotTimes[slot - 1] || { start: "00:00", end: "00:00" };
    const dateString = format(new Date(day), "yyyy-MM-dd");
    return {
      start: new Date(`${dateString}T${times.start}`),
      end: new Date(`${dateString}T${times.end}`),
    };
  };

  const handleSelectEvent = async (event) => {
    if (!user) {
      alert("Błąd: Nie można zidentyfikować użytkownika.");
      return;
    }

    if (
      window.confirm(
        `Czy chcesz zgłosić chęć zmiany terminu dla zajęć "${event.title}"?`
      )
    ) {
      setLoading(true);
      try {
        const changeRequestPayload = {
          course_event_id: parseInt(event.id.split("-")[1], 10),
          initiator_id: user.id,
          status: "PENDING",
          reason: "Chęć zmiany terminu zainicjowana z kalendarza.",
          room_requirements: "",
          created_at: new Date().toISOString(),
        };
        const newRequest = await apiRequest("/change_requests/", {
          method: "POST",
          body: JSON.stringify(changeRequestPayload),
        });
        alert(
          `Zgłoszenie #${newRequest.id} zostało pomyślnie utworzone. Zostaniesz teraz przekierowany do jego szczegółów, aby wskazać swoją dostępność.`
        );
        navigate(`/request/${newRequest.id}`);
      } catch (error) {
        alert(`Wystąpił błąd podczas tworzenia zgłoszenia: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography variant="h4" gutterBottom>
        Kalendarz Zajęć
      </Typography>

      <div
        style={{
          height: "78vh",
          backgroundColor: "white",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <Calendar
          localizer={localizer}
          culture="pl"
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={(newView) => setView(newView)}
          views={availableViews}
          onSelectEvent={handleSelectEvent}
          formats={calendarFormats}
          messages={{
            date: "Data",
            time: "Czas",
            event: "Wydarzenie",
            allDay: "Cały dzień",
            week: "Tydzień",
            work_week: "Tydzień roboczy",
            day: "Dzień",
            month: "Miesiąc",
            previous: "Poprzedni",
            next: "Następny",
            yesterday: "Wczoraj",
            tomorrow: "Jutro",
            today: "Dziś",
            agenda: "Agenda",
            noEventsInRange: "Brak wydarzeń w tym zakresie.",
            showMore: (total) => `+ ${total} więcej`,
          }}
        />
      </div>
    </Container>
  );
};

export default ChangeRequestsPage;
