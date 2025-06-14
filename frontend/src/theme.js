// src/theme.js
import { createTheme } from "@mui/material/styles";

// Profesjonalna paleta kolorów, inspirowana barwami akademickimi i technologicznymi.
// Główny kolor (primary) - stonowany, profesjonalny niebieski.
// Kolor pomocniczy (secondary) - energetyczny, ale nieagresywny turkus/mięta do akcentów.
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Klasyczny, zaufany niebieski
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#009688", // Elegancki turkus/teal
      light: "#4db6ac",
      dark: "#00796b",
    },
    background: {
      default: "#f4f6f8", // Jasnoszary, neutralny tło
      paper: "#ffffff", // Czysta biel dla kart i paneli
    },
    text: {
      primary: "#1c2025",
      secondary: "#5f6c7a",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: "#1c2025",
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none", // Przyciski bez wielkich liter - bardziej nowocześnie
      fontWeight: "600",
    },
  },
  shape: {
    borderRadius: 8, // Lekko zaokrąglone rogi dla nowoczesnego wyglądu
  },
  components: {
    // Globalne nadpisanie stylów dla kluczowych komponentów
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#1c2025",
          boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#1565c0",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.08)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        },
      },
    },
  },
});

export default theme;
