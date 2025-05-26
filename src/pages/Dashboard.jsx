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
    const [userId, setUserId] = useState(null);
    const [userGroups, setUserGroups] = useState([]);

    useEffect(() => {
        requestNotificationPermission();
        fetchUserData();
        fetchEvents();
        fetchBirthdays();
    }, []);

    useEffect(() => {
        handleDateChange(selectedDate);
    }, [events, birthdays]);

    const requestNotificationPermission = () => {
        if (Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                console.log("🔔 Permiso de notificaciones:", permission);
            });
        }
    };

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserId(res.data.id);
            setUserGroups(res.data.groups || []);
        } catch (error) {
            console.error("❌ Error al obtener datos del usuario:", error.response?.data || error.message);
        }
    };

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

            const allEvents = [...publicEvents.data, ...userEvents.data].map(event => ({
                ...event,
                date: new Date(event.date).toISOString().split("T")[0]
            }));

            setEvents(allEvents);
            checkForNewEvents(allEvents);
        } catch (error) {
            console.error("❌ Error al obtener eventos:", error.response?.data || error.message);
        }
    };

    const checkForNewEvents = (allEvents) => {
        if (!userId) return;

        const relevantEvents = allEvents.filter(event =>
            event.visibility === "public" ||
            event.target_user_id === userId ||
            (event.target_group_id && userGroups.includes(event.target_group_id))
        );

        if (relevantEvents.length > 0) {
            relevantEvents.forEach(event => sendNotification(event));
        }
    };

    const sendNotification = (event) => {
        if (Notification.permission === "granted") {
            new Notification("📅 Nuevo evento disponible", {
                body: `${event.title} - ${event.date}`,
                icon: "/icon.png"
            });
        }
    };

    const fetchBirthdays = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/birthdays/upcoming`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const birthdaysFormatted = res.data.map(user => ({
                ...user,
                birthdateFormatted: new Date(user.birthdate).toISOString().slice(0, 10)
            }));

            setBirthdays(birthdaysFormatted);
        } catch (error) {
            console.error("❌ Error al obtener cumpleaños:", error);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        const formattedDate = new Date(date).toISOString().split("T")[0];

        const filteredEvents = events.filter(event => event.date === formattedDate);
        setSelectedEvents(filteredEvents);

        const filteredBirthdays = birthdays.filter(user =>
            user.birthdateFormatted.slice(5) === formattedDate.slice(5)
        );
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
                                const formattedDate = date.toISOString().split("T")[0];

                                const hasEvent = events.some(event => event.date === formattedDate);
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
                    <h3>📆 Eventos del día</h3>
                    <ul>
                        {selectedEvents.length === 0 ? <p>No hay eventos en esta fecha.</p> : selectedEvents.map((event, index) => (
                            <li key={`${event.id}-${index}`}>🔵 <strong>{event.title}</strong> - {event.date}</li>
                        ))}
                    </ul>

                    <h3>🎂 Cumpleaños del día</h3>
                    <ul>
                        {selectedBirthdays.length === 0 ? (
                            <p>No hay cumpleaños en esta fecha.</p>
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
