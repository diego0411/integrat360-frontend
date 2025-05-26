import { useContext, useState } from "react";
import { Drawer, List, ListItem, ListItemText, ListItemIcon, IconButton, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import GroupIcon from "@mui/icons-material/Group";
import ChatIcon from "@mui/icons-material/Chat";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/ExitToApp";
import MenuIcon from "@mui/icons-material/Menu";
import WorkIcon from "@mui/icons-material/Work"; // 📌 Nuevo ícono para carpetas de proyectos
import "../styles/Sidebar.css";

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const { logout } = useContext(AuthContext);

    const toggleSidebar = () => {
        setOpen(!open);
    };

    return (
        <>
            {!open && (
                <IconButton className="floating-button" onClick={toggleSidebar}>
                    <MenuIcon sx={{ color: "white", fontSize: 30 }} />
                </IconButton>
            )}

            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? 250 : 0,
                    transition: "width 0.3s ease",
                    "& .MuiDrawer-paper": {
                        width: open ? 250 : 0,
                        background: "#1976D2",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        overflow: "hidden"
                    }
                }}
            >
                <div className="sidebar-header">
                    <img src="/solaria logo.png" alt="Solaria" className="logo" />
                    <IconButton className="toggle-button" onClick={toggleSidebar}>
                        <MenuIcon sx={{ color: "white", fontSize: 35 }} />
                    </IconButton>
                </div>

                <List className="sidebar-menu">
                    <ListItem button component={Link} to="/">
                        <ListItemIcon><HomeIcon sx={{ color: "white" }} /></ListItemIcon>
                        <ListItemText primary="Inicio" />
                    </ListItem>
                    <ListItem button component={Link} to="/folders">
                        <ListItemIcon><FolderIcon sx={{ color: "white" }} /></ListItemIcon>
                        <ListItemText primary="Gestión Documental" />
                    </ListItem>
                    <ListItem button component={Link} to="/folders/projects"> {/* 📌 Nueva opción */}
                        <ListItemIcon><WorkIcon sx={{ color: "white" }} /></ListItemIcon>
                        <ListItemText primary="Gestión de Proyectos" />
                    </ListItem>
                    <ListItem button component={Link} to="/manage-users">
                        <ListItemIcon><GroupIcon sx={{ color: "white" }} /></ListItemIcon>
                        <ListItemText primary="Usuarios" />
                    </ListItem>
                    <ListItem button component={Link} to="/chat">
                        <ListItemIcon><ChatIcon sx={{ color: "white" }} /></ListItemIcon>
                        <ListItemText primary="Chat" />
                    </ListItem>
                    <ListItem button component={Link} to="/manageevents">
                        <ListItemIcon><EventIcon sx={{ color: "white" }} /></ListItemIcon>
                        <ListItemText primary="Eventos" />
                    </ListItem>
                    <ListItem button component={Link} to="/managegroups">
                        <ListItemIcon><GroupIcon sx={{ color: "white" }} /></ListItemIcon>
                        <ListItemText primary="Grupos" />
                    </ListItem>
                </List>
                <Divider />
                <ListItem button onClick={logout} className="logout-button">
                    <ListItemIcon><LogoutIcon sx={{ color: "white", fontSize: 24 }} /></ListItemIcon>
                    <ListItemText primary="Cerrar sesión" />
                </ListItem>
            </Drawer>
        </>
    );
}
