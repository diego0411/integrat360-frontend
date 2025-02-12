import { useEffect, useState } from "react";
import axios from "axios";

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
            console.log("📅 Eventos cargados:", res.data);
        } catch (error) {
            setErrorMessage("❌ Error al obtener eventos.");
            console.error("❌ Error al obtener eventos:", error);
        }
    };

    // 📌 Crear un evento
    const handleSaveEvent = async () => {
        if (!title || !date || !visibility) {
            alert("Por favor, completa todos los campos obligatorios.");
            return;
        }

        if (new Date(date) < new Date()) {
            alert("La fecha del evento debe ser posterior a la fecha actual.");
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
            console.log("✅ Evento creado correctamente");
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
            console.log("🗑️ Evento eliminado correctamente");
            fetchEvents();
        } catch (error) {
            setErrorMessage("❌ Error al eliminar el evento.");
            console.error("❌ Error al eliminar el evento:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>📅 Gestión de Eventos</h1>

            {/* 📌 Mensaje de error */}
            {errorMessage && <div className="error-message">{errorMessage}</div>}

            {/* 📌 Formulario para agregar eventos */}
            <div className="event-form">
                <input
                    type="text"
                    placeholder="Título del evento"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                    <option value="public">Público</option>
                    <option value="private">Privado</option>
                </select>
                <button onClick={handleSaveEvent} disabled={loading}>
                    {loading ? "Cargando..." : "➕ Agregar Evento"}
                </button>
            </div>

            {/* 📌 Lista de eventos */}
            <h2>📋 Mis Eventos</h2>
            {events.length === 0 ? (
                <p>No hay eventos disponibles.</p>
            ) : (
                <ul className="chat-messages">
                    {events.map(event => (
                        <li key={event.id}>
                            <strong>{event.title}</strong> - {event.date} [{event.visibility}]
                            <p>{event.description}</p>
                            <button onClick={() => handleDeleteEvent(event.id)} disabled={loading}>
                                🗑️ Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ManageEvents;
