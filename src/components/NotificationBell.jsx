import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));

        socket.on("receiveNotification", (notification) => {
            setNotifications(prev => [...prev, notification]);

            // 📌 Mostrar notificación en el navegador
            if (Notification.permission === "granted") {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: "/icon.png"
                });
            }
        });

        return () => socket.disconnect();
    }, []);

    // 📌 Pedir permiso para notificaciones si no está concedido
    useEffect(() => {
        if (Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                console.log("🔔 Permiso de notificación:", permission);
            });
        }
    }, []);

    return (
        <div>
            🔔 {notifications.length > 0 ? notifications.length : ""}
        </div>
    );
}

export default NotificationBell;
