import { useEffect, useState } from "react";
import axios from "axios";

function ManageEvents() {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [visibility, setVisibility] = useState("public");

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
            console.error("❌ Error al obtener eventos:", error);
        }
    };

    // 📌 Crear un evento
    const handleSaveEvent = async () => {
        if (!title || !date || !visibility) {
            alert("Por favor, completa todos los campos obligatorios.");
            return;
        }

        const eventData = {
            title,
            description,
            date,
            visibility,
        };

        try {
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
            console.error("❌ Error al guardar evento:", error);
        }
    };

    // 📌 Eliminar un evento
    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este evento?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("🗑️ Evento eliminado correctamente");
            fetchEvents();
        } catch (error) {
            console.error("❌ Error al eliminar el evento:", error);
        }
    };

    return (
        <div className="container">
            <h1>📅 Gestión de Eventos</h1>

            {/* 📌 Formulario para agregar eventos */}
            <div className="event-form">
                <input type="text" placeholder="Título del evento" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input type="text" placeholder="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                    <option value="public">Público</option>
                    <option value="private">Privado</option>
                </select>
                <button onClick={handleSaveEvent}>➕ Agregar Evento</button>
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
                            <button onClick={() => handleDeleteEvent(event.id)}>🗑️ Eliminar</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ManageEvents;
