import { useEffect, useState } from "react";
import axios from "axios";
import { 
    Box, Typography, Button, TextField, Select, MenuItem, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { FaTrash } from "react-icons/fa";

function ManageEvents() {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    // 📌 Obtener eventos
    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/events/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(res.data);
        } catch (error) {
            setErrorMessage("❌ Error al obtener eventos.");
            console.error("❌ Error al obtener eventos:", error);
        }
    };

    // 📌 Crear un evento
    const handleSaveEvent = async () => {
        if (!title || !date || !visibility) {
            alert("⚠️ Completa todos los campos obligatorios.");
            return;
        }

        if (new Date(date) < new Date()) {
            alert("⛔ La fecha del evento debe ser futura.");
            return;
        }

        const eventData = { title, description, date, visibility };

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/events`, eventData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            setTitle("");
            setDescription("");
            setDate("");
            setVisibility("public");
            fetchEvents();
        } catch (error) {
            setErrorMessage("❌ Error al guardar evento.");
            console.error("❌ Error al guardar evento:", error);
        } finally {
            setLoading(false);
        }
    };

    // 📌 Eliminar un evento
    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este evento?")) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEvents();
        } catch (error) {
            setErrorMessage("❌ Error al eliminar el evento.");
            console.error("❌ Error al eliminar el evento:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh", maxWidth: "800px", margin: "auto", borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h5" gutterBottom>📅 Gestión de Eventos</Typography>

            {/* 📌 Mensaje de error */}
            {errorMessage && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Typography>
            )}

            {/* 📌 Formulario para agregar eventos */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6">Agregar Evento</Typography>
                <Box component="form" sx={{ display: "grid", gap: 2, mt: 2 }}>
                    <TextField size="small" label="Título del evento" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <TextField size="small" label="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <TextField size="small" label="Fecha del evento" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    <Select size="small" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                        <MenuItem value="public">Público</MenuItem>
                        <MenuItem value="private">Privado</MenuItem>
                    </Select>
                    <Button onClick={handleSaveEvent} variant="contained" disabled={loading}>
                        {loading ? "Cargando..." : "➕ Agregar Evento"}
                    </Button>
                </Box>
            </Paper>

            {/* 📌 Lista de eventos */}
            <Typography variant="h6">📋 Mis Eventos</Typography>
            {loading ? (
                <CircularProgress />
            ) : events.length === 0 ? (
                <Typography>No hay eventos disponibles.</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Título</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Visibilidad</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map(event => (
                                <TableRow key={event.id}>
                                    <TableCell>{event.title}</TableCell>
                                    <TableCell>{event.date}</TableCell>
                                    <TableCell>{event.visibility === "public" ? "Público" : "Privado"}</TableCell>
                                    <TableCell>
                                        <Button size="small" color="error" onClick={() => handleDeleteEvent(event.id)} sx={{ minWidth: "auto" }}>
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

export default ManageEvents;
