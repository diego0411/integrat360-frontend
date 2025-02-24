import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { FaEye, FaTrash, FaTimes } from "react-icons/fa";
import { 
    Box, Button, TextField, Select, MenuItem, Typography, List, ListItem, ListItemText, 
    ListItemSecondaryAction, IconButton, Paper, Divider 
} from "@mui/material";
import "../styles/estilos-optimizados.css"; // ✅ Importamos el archivo de estilos

function ManageGroups() {
    const { user } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedUser, setSelectedUser] = useState("");
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

    useEffect(() => {
        fetchGroups();
        fetchUsers();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(response.data || []);
        } catch (error) {
            console.error("❌ Error al obtener grupos:", error);
            setGroups([]);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        } catch (error) {
            console.error("❌ Error al obtener usuarios:", error);
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            alert("❌ El nombre del grupo no puede estar vacío.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/groups`,
                { name: newGroupName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewGroupName("");
            setShowCreateGroup(false);
            fetchGroups();
        } catch (error) {
            console.error("❌ Error al crear grupo:", error);
        }
    };

    const fetchGroupMembers = async (group) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${group.id}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSelectedGroup({ ...group, members: res.data });
            setShowAddMember(false);
        } catch (error) {
            console.error("❌ Error al obtener miembros del grupo:", error);
        }
    };

    const handleAddUserToGroup = async () => {
        if (!selectedGroup || !selectedUser) {
            alert("❌ Selecciona un grupo y un usuario.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/groups/${selectedGroup.id}/members`,
                { userId: selectedUser },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchGroupMembers(selectedGroup);
            setSelectedUser("");
            setShowAddMember(false);
        } catch (error) {
            console.error("❌ Error al agregar usuario:", error);
        }
    };

    const handleRemoveUserFromGroup = async (userId) => {
        if (!selectedGroup) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/groups/${selectedGroup.id}/members/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchGroupMembers(selectedGroup);
        } catch (error) {
            console.error("❌ Error al eliminar usuario del grupo:", error);
        }
    };

    return (
        <Box className="container">
            <Typography variant="h5" className="title">👥 Gestión de Grupos</Typography>

            {/* 📌 Crear Grupo */}
            <Button className="btn-primary" onClick={() => setShowCreateGroup(!showCreateGroup)}>
                {showCreateGroup ? <FaTimes /> : "+ Crear Grupo"}
            </Button>

            {showCreateGroup && (
                <Paper className="form-container">
                    <TextField
                        fullWidth
                        label="Nombre del grupo"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="input-field"
                    />
                    <Button className="btn-primary" onClick={handleCreateGroup}>Crear</Button>
                </Paper>
            )}

            {/* 📌 Lista de Grupos */}
            <Typography variant="h6">📋 Lista de Grupos</Typography>
            {groups.length === 0 ? (
                <Typography variant="body2">⚠️ No hay grupos creados.</Typography>
            ) : (
                <List className="group-list">
                    {groups.map((group) => (
                        <ListItem key={group.id} className="group-item" button onClick={() => fetchGroupMembers(group)}>
                            <ListItemText primary={group.name} />
                            <ListItemSecondaryAction>
                                <IconButton onClick={() => fetchGroupMembers(group)} className="btn-view">
                                    <FaEye />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}

            <Divider className="divider" />

            {/* 📌 Miembros del Grupo */}
            {selectedGroup && (
                <Paper className="group-container">
                    <Typography variant="h6">👥 Miembros de: {selectedGroup.name}</Typography>

                    <Button className="btn-primary" onClick={() => setShowAddMember(!showAddMember)}>
                        {showAddMember ? <FaTimes /> : "➕ Agregar Miembro"}
                    </Button>

                    {showAddMember && (
                        <Paper className="form-container">
                            <Select
                                fullWidth
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                displayEmpty
                                className="select-input"
                            >
                                <MenuItem value="" disabled>Selecciona un usuario</MenuItem>
                                {users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </MenuItem>
                                ))}
                            </Select>
                            <Button className="btn-primary" onClick={handleAddUserToGroup}>Agregar</Button>
                        </Paper>
                    )}

                    {selectedGroup.members.length === 0 ? (
                        <Typography variant="body2">⚠️ No hay miembros en este grupo.</Typography>
                    ) : (
                        <List>
                            {selectedGroup.members.map((member) => (
                                <ListItem key={member.id} className="member-item">
                                    <ListItemText primary={`${member.name} (${member.email})`} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleRemoveUserFromGroup(member.id)} className="btn-delete">
                                            <FaTrash />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            )}
        </Box>
    );
}

export default ManageGroups;
