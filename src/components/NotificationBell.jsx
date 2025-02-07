import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));
        socket.on("receiveNotification", (notification) => {
            setNotifications(prev => [...prev, notification]);
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div>
            🔔 {notifications.length}
        </div>
    );
}

export default NotificationBell;
