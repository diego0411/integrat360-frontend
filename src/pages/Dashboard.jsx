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

            const publicData = Array.isArray(publicEvents.data) ? publicEvents.data : [];
            const userData = Array.isArray(userEvents.data) ? userEvents.data : [];

            const allEvents = [...publicData, ...userData].map(event => ({
                ...event,
                date: event.date ? new Date(event.date).toISOString().split("T")[0] : null
            })).filter(event => event.date);

            setEvents(allEvents);
        } catch (error) {
            console.error("❌ Error al obtener eventos:", error.response?.data || error.message);
        }
    };

    // 📌 Obtener cumpleaños
    const fetchBirthdays = async () => {
        try {
            const token = localStorage.getItem("token");
            const month = new Date().getMonth() + 1; 

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/birthdays?month=${month}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = res.data;
            if (!data || data.length === 0) return;

            const birthdaysFormatted = data.map(user => ({
                ...user,
                birthdateFormatted: new Date(user.birthdate).toISOString().slice(0, 10)
            }));

            setBirthdays(birthdaysFormatted);
        } catch (error) {
            console.error("❌ Error al obtener cumpleaños:", error);
        }
    };

    // 📌 Manejar el cambio de fecha en el calendario (Ahora filtra toda la semana)
    const handleDateChange = (date) => {
        setSelectedDate(date);

        // 📌 Calcular el lunes y domingo de la semana seleccionada
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Lunes
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(date);
        endOfWeek.setDate(date.getDate() - date.getDay() + 7); // Domingo
        endOfWeek.setHours(23, 59, 59, 999);

        console.log(`📅 Mostrando eventos y cumpleaños entre: ${startOfWeek.toISOString().split("T")[0]} - ${endOfWeek.toISOString().split("T")[0]}`);

        // 📌 Filtrar eventos dentro de la semana
        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });

        setSelectedEvents(filteredEvents);

        // 📌 Filtrar cumpleaños dentro de la semana (Comparando solo día y mes)
        const filteredBirthdays = birthdays.filter(user => {
            const birthMonthDay = user.birthdateFormatted.slice(5); // "MM-DD"
            return [...Array(7)].some((_, i) => {
                const weekDay = new Date(startOfWeek);
                weekDay.setDate(startOfWeek.getDate() + i);
                return weekDay.toISOString().slice(5, 10) === birthMonthDay;
            });
        });

        setSelectedBirthdays(filteredBirthdays);
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

                                const hasBirthday = birthdays.some(user => 
                                    user.birthdateFormatted.slice(5) === formattedDate.slice(5)
                                );

                                return (
                                    <div className="calendar-icons">
                                        {hasEvent && <span className="event-marker">🔵</span>}
                                        {hasBirthday && <span className="birthday-marker">🎈</span>}
                                    </div>
                                );
                            }
                        }}
                    />
                </div>

                <div className="events-section">
                    <h3>📆 Eventos de la semana</h3>
                    <ul>
                        {selectedEvents.length === 0 ? <p>No hay eventos esta semana.</p> : selectedEvents.map(event => (
                            <li key={event.id}>🔵 <strong>{event.title}</strong> - {event.date}</li>
                        ))}
                    </ul>

                    <h3>🎂 Cumpleaños de la semana</h3>
                    <ul>
                        {selectedBirthdays.length === 0 ? (
                            <p>No hay cumpleaños esta semana.</p>
                        ) : (
                            selectedBirthdays.map((user, index) => (
                                <li key={`${user.id}-${index}`}>🎈 {user.name} - {user.birthdateFormatted}</li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
