import { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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

    useEffect(() => {
        handleDateChange(selectedDate);
    }, [events, birthdays]);

    // 📌 Obtener eventos
    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem("token");
            const [publicEvents, userEvents] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/events/public`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/events/user`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
    
            // 📌 Verificar si los datos son arrays válidos
            const publicData = Array.isArray(publicEvents.data) ? publicEvents.data : [];
            const userData = Array.isArray(userEvents.data) ? userEvents.data : [];
    
            // 📌 Unir eventos y asegurarse de que tienen fecha
            const allEvents = [...publicData, ...userData].map(event => ({
                ...event,
                date: event.date ? new Date(event.date).toISOString().split("T")[0] : null
            })).filter(event => event.date); // Filtrar eventos sin fecha
    
            setEvents(allEvents);
            console.log("📅 Eventos cargados:", allEvents);
        } catch (error) {
            console.error("❌ Error al obtener eventos:", error.response?.data || error.message);
        }
    };
    

    // 📌 Obtener cumpleaños
    const fetchBirthdays = async () => {
        try {
            const token = localStorage.getItem("token");
            const month = new Date().getMonth() + 1; // Obtener el mes actual
    
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/birthdays?month=${month}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const data = res.data;
            if (!data || data.length === 0) {
                console.log("No hay cumpleaños este mes.");
                return;
            }
    
            // Convertir fechas para asegurar formato correcto
            const birthdaysFormatted = data.map(user => ({
                ...user,
                birthdateFormatted: new Date(user.birthdate).toISOString().slice(0, 10)
            }));
    
            setBirthdays(birthdaysFormatted);
            console.log("🎂 Cumpleaños obtenidos:", birthdaysFormatted);
        } catch (error) {
            console.error("❌ Error al obtener cumpleaños:", error);
        }
    };
    

    // 📌 Manejar el cambio de fecha en el calendario
    const handleDateChange = (date) => {
        setSelectedDate(date);
        const formattedDate = new Date(date).toISOString().split("T")[0];
    
        // 📌 Convertir y comparar correctamente las fechas
        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date).toISOString().split("T")[0];
            return eventDate === formattedDate;
        });
    
        setSelectedEvents(filteredEvents);
    
        // 🔹 Filtrar cumpleaños correctamente
        const filteredBirthdays = birthdays.filter(user => 
            user.birthdateFormatted.slice(5) === formattedDate.slice(5)
        );
        setSelectedBirthdays(filteredBirthdays);
    
        console.log("📅 Eventos en la fecha seleccionada:", filteredEvents);
        console.log("🎂 Cumpleaños en la fecha seleccionada:", filteredBirthdays);
    };
    
    
    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">📅 Eventos</h2>

            <div className="dashboard-content">
                <div className="calendar-container">
                    <Calendar
                        onChange={handleDateChange}
                        value={selectedDate}
                        tileContent={({ date, view }) => {
                            if (view === "month") {
                                const formattedDate = new Date(date).toISOString().split("T")[0];
                                const hasEvent = events.some(event => {
                                    const eventDate = new Date(event.date).toISOString().split("T")[0];
                                    return eventDate === formattedDate;
                                });
                                return hasEvent ? <div className="event-marker">🎉</div> : null;
                            }
                        }}
                    />
                </div>

                <div className="events-section">
                    <h3>📆 Eventos del día</h3>
                    <ul>
                        {selectedEvents.length === 0 ? <p>No hay eventos en esta fecha.</p> : selectedEvents.map(event => (
                            <li key={event.id}>🎉 <strong>{event.title}</strong></li>
                        ))}
                    </ul>

                    <h3>🎂 Cumpleaños del día</h3>
                    <ul>
                        {selectedBirthdays.length === 0 ? (
                            <p>No hay cumpleaños en esta fecha.</p>
                        ) : (
                            selectedBirthdays.map((user, index) => (
                                <li key={`${user.id}-${index}`}>🎉 {user.name} - {user.birthdateFormatted}</li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;