import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function Chat() {
    const { user } = useContext(AuthContext);
    const [selectedChat, setSelectedChat] = useState("public");
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [error, setError] = useState(null);
    const [lastMessageId, setLastMessageId] = useState(null); // Para rastrear el último mensaje recibido

    useEffect(() => {
        requestNotificationPermission();
        fetchUsers();
        fetchGroups();
        fetchMessages();
    }, [selectedChat, selectedUser, selectedGroup]);

    // 📌 Solicitar permisos de notificación
    const requestNotificationPermission = () => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission !== "granted") {
                    console.warn("⚠️ Notificaciones bloqueadas por el usuario.");
                }
            });
        }
    };

    // 📌 Función para mostrar notificaciones en el navegador
    const showNotification = (messageContent) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Nuevo mensaje en el chat", {
                body: messageContent,
                icon: "/chat-icon.png"
            });
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data || []);
        } catch (error) {
            console.error("❌ Error al obtener usuarios:", error);
        }
    };

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGroups(res.data || []);
        } catch (error) {
            console.error("❌ Error al obtener grupos:", error);
        }
    };

    const fetchMessages = async () => {
        try {
            setError(null);
            const token = localStorage.getItem("token");
            if (!token) return;

            let url = `${import.meta.env.VITE_API_URL}/chat/public`;
            if (selectedChat === "private" && selectedUser) {
                url = `${import.meta.env.VITE_API_URL}/chat/private/${selectedUser}`;
            } else if (selectedChat === "group") {
                if (!selectedGroup) {
                    console.error("⚠️ No se ha seleccionado un grupo.");
                    return;
                }
                url = `${import.meta.env.VITE_API_URL}/chat/group/${selectedGroup}`;
            }

            console.log(`📢 Obteniendo mensajes desde: ${url}`);
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

            if (!res.data || !Array.isArray(res.data)) {
                console.error("❌ Respuesta inválida:", res.data);
                setError("Error al obtener mensajes.");
                return;
            }

            const receivedMessages = res.data.flat();

            // 📌 Detectar nuevos mensajes
            if (receivedMessages.length > 0) {
                const lastReceivedMessage = receivedMessages[receivedMessages.length - 1];

                if (lastMessageId && lastReceivedMessage.id !== lastMessageId) {
                    if (lastReceivedMessage.sender_id !== user.id) {
                        showNotification(`${lastReceivedMessage.sender_name}: ${lastReceivedMessage.message}`);
                    }
                }
                setLastMessageId(lastReceivedMessage.id);
            }

            setMessages(receivedMessages);
        } catch (error) {
            console.error("❌ Error al obtener mensajes:", error);
            setError("No se pudieron cargar los mensajes.");
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return alert("⚠️ El mensaje no puede estar vacío.");
    
        try {
            setError(null);
            const token = localStorage.getItem("token");
            if (!token) return;
    
            const data = { message, receiver_id: null, group_id: null };
    
            if (selectedChat === "private" && selectedUser) {
                data.receiver_id = selectedUser;
            } else if (selectedChat === "group" && selectedGroup) {
                data.group_id = selectedGroup;
            }
    
            console.log("📩 Enviando mensaje:", data);
    
            await axios.post(`${import.meta.env.VITE_API_URL}/chat`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            setMessage("");
            setTimeout(fetchMessages, 1000);
        } catch (error) {
            console.error("❌ Error al enviar mensaje:", error.response?.data || error.message);
            setError("No se pudo enviar el mensaje.");
        }
    };

    return (
        <div className="chat-container">
            <h1>💬 Chat Interno</h1>

            {error && <p className="error-message">{error}</p>}

            <div className="chat-type">
                <button onClick={() => setSelectedChat("public")}>🌍 Público</button>
                <button onClick={() => setSelectedChat("private")}>👤 Privado</button>
                <button onClick={() => setSelectedChat("group")}>👥 Grupo</button>
            </div>

            {selectedChat === "private" && (
                <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
                    <option value="">Selecciona un usuario</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            )}
            {selectedChat === "group" && (
                <select onChange={(e) => setSelectedGroup(e.target.value)} value={selectedGroup}>
                    <option value="">Selecciona un grupo</option>
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            )}

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <p>No hay mensajes.</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.sender_id === user.id ? "sent" : "received"}`}>
                            <strong>{msg.sender_name}:</strong> {msg.message}
                        </div>
                    ))
                )}
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Enviar</button>
            </div>
        </div>
    );
}

export default Chat;
