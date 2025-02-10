import React from "react";
import { Drawer, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import GroupIcon from "@mui/icons-material/Group";
import ChatIcon from "@mui/icons-material/Chat";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import "../styles/Sidebar.css";


export default function Sidebar() {
    return (
        <Drawer variant="permanent" sx={{ width: 250, "& .MuiDrawer-paper": { width: 250, background: "#1976D2", color: "white" } }}>
            <List>
                <ListItem button component={Link} to="/">
                    <ListItemIcon><HomeIcon sx={{ color: "white" }} /></ListItemIcon>
                    <ListItemText primary="Inicio" />
                </ListItem>
                <ListItem button component={Link} to="/documents">
                    <ListItemIcon><InsertDriveFileIcon sx={{ color: "white" }} /></ListItemIcon>
                    <ListItemText primary="Documentos" />
                </ListItem>
                <ListItem button component={Link} to="/folders">
                    <ListItemIcon><FolderIcon sx={{ color: "white" }} /></ListItemIcon>
                    <ListItemText primary="Carpetas" />
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
                <ListItem button component={Link} to="/settings">
                    <ListItemIcon><SettingsIcon sx={{ color: "white" }} /></ListItemIcon>
                    <ListItemText primary="Configuraciones" />
                </ListItem>
            </List>
        </Drawer>
    );
}
