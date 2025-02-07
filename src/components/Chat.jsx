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

    useEffect(() => {
        fetchUsers();
        fetchGroups();
        fetchMessages();
    }, [selectedChat, selectedUser, selectedGroup]);

    // 📌 Obtener lista de usuarios
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        } catch (error) {
            console.error("❌ Error al obtener usuarios:", error);
        }
    };

    // 📌 Obtener grupos
    const fetchGroups = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("⚠️ No hay token de autenticación.");
            return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data || response.data.length === 0) {
            console.warn("⚠️ No hay grupos disponibles.");
            setGroups([]);
            return;
        }

        console.log("📌 Grupos obtenidos:", response.data);
        setGroups(response.data);
    } catch (error) {
        console.error("❌ Error al obtener grupos:", error.response?.data || error.message);
    }
};

    // 📌 Obtener mensajes según el tipo de chat
    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("token");
            let url = `${import.meta.env.VITE_API_URL}/chat/public`;
            if (selectedChat === "private" && selectedUser) {
                url = `${import.meta.env.VITE_API_URL}/chat/private/${selectedUser}`;
            } else if (selectedChat === "group" && selectedGroup) {
                url = `${import.meta.env.VITE_API_URL}/chat/group/${selectedGroup}`;
            }

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessages(res.data);
        } catch (error) {
            console.error("❌ Error al obtener mensajes:", error);
        }
    };

    // 📌 Enviar mensaje
    const sendMessage = async () => {
        if (!message.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const data = { message };

            if (selectedChat === "private") {
                data.receiver_id = selectedUser;
            } else if (selectedChat === "group") {
                data.group_id = selectedGroup;
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/chat`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage("");
            fetchMessages();
        } catch (error) {
            console.error("❌ Error al enviar mensaje:", error);
        }
    };

    return (
        <div className="chat-container">
            <h1>💬 Chat Interno</h1>

            {/* 📌 Selector de tipo de chat */}
            <div className="chat-type">
                <button onClick={() => setSelectedChat("public")}>🌍 Público</button>
                <button onClick={() => setSelectedChat("private")}>👤 Privado</button>
                <button onClick={() => setSelectedChat("group")}>👥 Grupo</button>
            </div>

            {/* 📌 Selector de usuario o grupo */}
            {selectedChat === "private" && (
                <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
                    <option value="">Selecciona un usuario</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </select>
            )}
            {selectedChat === "group" && (
                <select onChange={(e) => setSelectedGroup(e.target.value)} value={selectedGroup}>
                    <option value="">Selecciona un grupo</option>
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.name}
                        </option>
                    ))}
                </select>
            )}

            {/* 📌 Mensajes */}
            <div className="messages">
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

            {/* 📌 Input para enviar mensaje */}
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
