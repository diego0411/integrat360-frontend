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

            // Formateamos las fechas y unimos los eventos públicos y privados
            const allEvents = [...publicEvents.data, ...userEvents.data].map(event => {
                const formattedDate = new Date(event.date);
                return {
                    ...event,
                    date: formattedDate.toISOString().split("T")[0]
                };
            });

            setEvents(allEvents);
            console.log("📅 Eventos cargados:", allEvents);
        } catch (error) {
            console.error("❌ Error al obtener eventos:", error);
        }
    };

    // 📌 Obtener cumpleaños
    const fetchBirthdays = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/birthdays`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Formateamos las fechas de cumpleaños
            const formattedBirthdays = res.data.map(user => {
                const formattedDate = new Date(user.birthdate);
                return {
                    ...user,
                    birthdateFormatted: formattedDate.toISOString().split("T")[0]
                };
            });

            setBirthdays(formattedBirthdays);
            console.log("🎂 Cumpleaños cargados:", formattedBirthdays);
        } catch (error) {
            console.error("❌ Error al obtener cumpleaños:", error);
        }
    };

    // 📌 Calcular el rango de la semana para filtrar eventos y cumpleaños
    const getWeekRange = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay()); // Inicio de la semana

        const end = new Date(start);
        end.setDate(end.getDate() + 6); // Fin de la semana

        return { start, end };
    };

    // 📌 Manejar el cambio de fecha en el calendario
    const handleDateChange = (date) => {
        setSelectedDate(date);
        const { start, end } = getWeekRange(date);

        console.log(`📆 Semana seleccionada: ${start.toISOString().split("T")[0]} - ${end.toISOString().split("T")[0]}`);

        // Filtramos los eventos dentro de la semana seleccionada
        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= start && eventDate <= end;
        });
        setSelectedEvents(filteredEvents);

        // Filtramos los cumpleaños dentro de la semana seleccionada
        const startMonthDay = start.toISOString().slice(5, 10);
        const endMonthDay = end.toISOString().slice(5, 10);
        const filteredBirthdays = birthdays.filter(user => {
            const userBirthMonthDay = user.birthdateFormatted.slice(5, 10);
            return userBirthMonthDay >= startMonthDay && userBirthMonthDay <= endMonthDay;
        });

        setSelectedBirthdays(filteredBirthdays);

        console.log("🎂 Cumpleaños en la semana seleccionada:", filteredBirthdays);
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
                                const formattedDate = date.toISOString().split("T")[0];
                                const hasEvent = events.some(event => event.date === formattedDate);
                                return hasEvent ? <div className="event-marker">🎉</div> : null;
                            }
                        }}
                    />
                </div>

                <div className="events-section">
                    <h3>📆 Eventos de la semana</h3>
                    <ul>
                        {selectedEvents.length === 0 ? <p>No hay eventos esta semana.</p> : selectedEvents.map(event => (
                            <li key={event.id}>🎉 <strong>{event.title}</strong></li>
                        ))}
                    </ul>

                    <h3>🎂 Cumpleaños de la semana</h3>
                    <ul>
                        {selectedBirthdays.length === 0 ? <p>No hay cumpleaños esta semana.</p> : selectedBirthdays.map(user => (
                            <li key={user.id}>🎉 {user.name} - {user.birthdateFormatted}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
