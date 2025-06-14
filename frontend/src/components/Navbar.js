import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { UserContext } from "../App";
import SchoolIcon from "@mui/icons-material/School";
import Logout from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const roleTranslations = {
    ADMIN: "Administrator",
    KOORDYNATOR: "Koordynator",
    PROWADZACY: "Prowadzący",
    STAROSTA: "Starosta",
  };

  return (
    <AppBar position="fixed" color="default">
      <Toolbar>
        <SchoolIcon sx={{ mr: 2, color: "primary.main" }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/main")}
        >
          System Rezerwacji Sal
        </Typography>

        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <Button color="inherit" onClick={() => navigate("/main")}>
            Strona główna
          </Button>
          <Button color="inherit" onClick={() => navigate("/requests")}>
            Kalendarz / Zgłoszenia
          </Button>
          <Button color="inherit" onClick={() => navigate("/proposals")}>
            Propozycje
          </Button>
        </Box>

        <Box sx={{ flexGrow: 0, ml: 2 }}>
          <Tooltip title="Opcje użytkownika">
            <IconButton onClick={handleMenu} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: "secondary.main" }}>
                {getInitials(user?.name)}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            keepMounted
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={open}
            onClose={handleClose}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" noWrap>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {roleTranslations[user?.role] || user?.role}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Wyloguj
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
