import { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "/src/styles/Dashboard.css";


function Dashboard() {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [birthdays, setBirthdays] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [selectedBirthdays, setSelectedBirthdays] = useState([]);

    useEffect(() => {
        fetchEvents();
        fetchBirthdays();
    }, []);

    // 📌 Obtener eventos públicos y privados del usuario autenticado
    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem("token");

            // 🔹 Obtener eventos públicos y eventos del usuario autenticado
            const [publicEvents, userEvents] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/events/public`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/events/user`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            // 🔹 Combinar ambos eventos en una sola lista
            const allEvents = [...publicEvents.data, ...userEvents.data];

            // 📌 Convertir fechas a formato "YYYY-MM-DD"
            const formattedEvents = allEvents.map(event => ({
                ...event,
                date: new Date(event.date).toISOString().split("T")[0]
            }));

            setEvents(formattedEvents);
            console.log("📅 Eventos públicos y del usuario cargados:", formattedEvents);
        } catch (error) {
            console.error("❌ Error al obtener eventos:", error);
        }
    };

    // 📌 Obtener cumpleaños de TODOS los usuarios
    const fetchBirthdays = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/birthdays`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 📌 Convertir fechas de cumpleaños a formato "MM-DD" para comparación sin el año
            const formattedBirthdays = res.data.map(user => ({
                ...user,
                birthdate: new Date(user.birthdate).toISOString().slice(5, 10) // Extrae solo "MM-DD"
            }));

            setBirthdays(formattedBirthdays);
            console.log("🎂 Cumpleaños cargados y formateados:", formattedBirthdays);
        } catch (error) {
            console.error("❌ Error al obtener cumpleaños:", error);
        }
    };

    // 📌 Manejar selección de fecha
    const handleDateChange = (date) => {
        const formattedDate = date.toISOString().split("T")[0]; // 📆 Convertir fecha seleccionada a "YYYY-MM-DD"
        const formattedMonthDay = formattedDate.slice(5, 10); // 📆 Extraer solo "MM-DD"
        setSelectedDate(date);

        console.log(`📆 Fecha seleccionada: ${formattedDate}`);

        // 📌 Filtrar eventos para la fecha seleccionada
        const filteredEvents = events.filter(event => event.date === formattedDate);
        setSelectedEvents(filteredEvents);

        // 📌 Filtrar cumpleaños para la fecha seleccionada (comparando solo "MM-DD")
        const filteredBirthdays = birthdays.filter(user => user.birthdate === formattedMonthDay);
        setSelectedBirthdays(filteredBirthdays);

        console.log("🎂 Cumpleaños en la fecha seleccionada:", filteredBirthdays);
    };

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">📅 Eventos</h2>

            {/* 📌 Contenedor para organizar el calendario y la lista de eventos */}
            <div className="dashboard-content">
                
                {/* 📆 Calendario */}
                <div className="calendar-container">
                    <Calendar
                        onChange={handleDateChange}
                        value={selectedDate}
                        tileContent={({ date, view }) => {
                            if (view === "month") {
                                const formattedDate = date.toISOString().split("T")[0];

                                // 📌 Verifica si hay eventos en la fecha actual
                                const hasEvent = events.some(event => event.date === formattedDate);

                                return hasEvent ? (
                                    <div className="event-marker" title="Evento">
                                        🎉
                                    </div>
                                ) : null;
                            }
                        }}
                    />
                </div>

                {/* 📌 Lista de eventos y cumpleaños */}
                <div className="events-section">
                    <h3>📆 Eventos del {selectedDate.toLocaleDateString()}</h3>
                    {selectedEvents.length === 0 ? (
                        <p>No hay eventos para este día.</p>
                    ) : (
                        <ul>
                            {selectedEvents.map(event => (
                                <li key={event.id}>
                                    🎉 <strong>{event.title}</strong> - {event.visibility === "public" ? "🌎 Público" : "🔒 Privado"}
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3>🎂 Cumpleaños el {selectedDate.toLocaleDateString()}</h3>
                    {selectedBirthdays.length > 0 ? (
                        <ul>
                            {selectedBirthdays.map(user => (
                                <li key={user.id}>🎉 {user.name || user.full_name}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No hay cumpleaños para esta fecha.</p>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Dashboard;
