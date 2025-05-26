import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    Box, Typography, Button, TextField, Select, MenuItem, CircularProgress, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/estilos-optimizados.css"; // ✅ Importamos el archivo de estilos

function ManageUsers() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user", birthdate: "" });
    const [editUserId, setEditUserId] = useState(null);

    useEffect(() => {
        if (user?.role !== "admin") {
            navigate("/");
        } else {
            fetchUsers();
        }
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            console.log("📌 Solicitando usuarios...");
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
            console.log("✅ Usuarios recibidos:", res.data);
        } catch (error) {
            console.error("❌ Error al obtener usuarios:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterOrEdit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (editUserId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/users/${editUserId}`, newUser, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("✅ Usuario actualizado correctamente.");
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, newUser);
                alert("✅ Usuario registrado correctamente.");
            }
            setNewUser({ name: "", email: "", password: "", role: "user", birthdate: "" });
            setEditUserId(null);
            fetchUsers();
        } catch (error) {
            console.error("❌ Error al registrar/actualizar usuario:", error.response?.data || error.message);
        }
    };

    const handleEdit = (user) => {
        setNewUser({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            birthdate: user.birthdate,
        });
        setEditUserId(user.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(user => user.id !== id));
            alert("✅ Usuario eliminado correctamente.");
        } catch (error) {
            console.error("❌ Error al eliminar usuario:", error.response?.data || error.message);
        }
    };

    return (
        <Box className="container">
            <Typography variant="h5" className="title">👥 Gestión de Usuarios</Typography>

            {/* 📌 Formulario de Registro y Edición */}
            <Paper className="form-container">
                <Typography variant="h6">{editUserId ? "Editar Usuario" : "Registrar Nuevo Usuario"}</Typography>
                <Box component="form" onSubmit={handleRegisterOrEdit} className="form-grid">
                    <TextField size="small" label="Nombre" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
                    <TextField size="small" label="Correo" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                    {!editUserId && <TextField size="small" label="Contraseña" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />}
                    <TextField size="small" label="Fecha de Nacimiento" type="date" value={newUser.birthdate} onChange={(e) => setNewUser({ ...newUser, birthdate: e.target.value })} required />
                    <Select size="small" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="select-input">
                        <MenuItem value="user">Usuario</MenuItem>
                        <MenuItem value="admin">Administrador</MenuItem>
                    </Select>
                    <Button type="submit" className="btn-primary">{editUserId ? "Actualizar" : "Registrar"}</Button>
                    {editUserId && <Button className="btn-cancel" onClick={() => { setEditUserId(null); setNewUser({ name: "", email: "", password: "", role: "user", birthdate: "" }) }}>Cancelar</Button>}
                </Box>
            </Paper>

            {/* 📌 Lista de Usuarios */}
            {loading ? (
                <CircularProgress className="loading-spinner" />
            ) : (
                <TableContainer component={Paper} className="table-container">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Correo</TableCell>
                                <TableCell>Rol</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role === "admin" ? "Administrador" : "Usuario"}</TableCell>
                                    <TableCell>
                                        <Button size="small" onClick={() => handleEdit(user)} className="btn-icon">
                                            <FaEdit />
                                        </Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(user.id)} className="btn-icon">
                                            <FaTrash />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default ManageUsers;
