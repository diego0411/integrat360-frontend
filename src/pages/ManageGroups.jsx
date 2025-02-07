import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function ManageGroups() {
    const { user } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedUser, setSelectedUser] = useState("");

    // 📌 Cargar grupos y usuarios cuando se monta el componente
    useEffect(() => {
        fetchGroups();
        fetchUsers();
    }, []);

    // 📌 Obtener la lista de grupos
    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("⚠️ No hay token de autenticación.");
                setGroups([]); // ✅ Evita problemas si no hay token
                return;
            }
    
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (!response.data || !Array.isArray(response.data)) {
                console.warn("⚠️ Respuesta inesperada de la API, asegurando un array vacío.");
                setGroups([]); // ✅ Asegura que groups no sea null
                return;
            }
    
            console.log("📌 Grupos obtenidos:", response.data);
            setGroups(response.data);
        } catch (error) {
            console.error("❌ Error al obtener grupos:", error.response?.data || error.message);
            setGroups([]); // ✅ Evita que groups tenga valores inválidos
        }
    };
    
    // 📌 Obtener la lista de usuarios
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

    // 📌 Crear un nuevo grupo
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) {
            alert("❌ El nombre del grupo no puede estar vacío.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/groups`,
                { name: newGroupName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewGroupName("");
            fetchGroups();
            alert("✅ Grupo creado exitosamente.");
        } catch (error) {
            console.error("❌ Error al crear grupo:", error);
        }
    };

    // 📌 Obtener miembros de un grupo
    const fetchGroupMembers = async (groupId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSelectedGroup({ ...selectedGroup, members: res.data });
        } catch (error) {
            console.error("❌ Error al obtener miembros del grupo:", error);
        }
    };

    // 📌 Agregar un usuario a un grupo
    const handleAddUserToGroup = async () => {
        if (!selectedGroup || !selectedUser) {
            alert("❌ Selecciona un grupo y un usuario.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/groups/${selectedGroup.id}/members`,
                { userId: selectedUser },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchGroupMembers(selectedGroup.id);
            alert("✅ Usuario agregado correctamente al grupo.");
        } catch (error) {
            console.error("❌ Error al agregar usuario:", error);
        }
    };

    // 📌 Eliminar un grupo (solo el creador puede hacerlo)
    const handleDeleteGroup = async (groupId, createdBy) => {
        if (user.id !== createdBy) {
            alert("⚠️ Solo el creador del grupo puede eliminarlo.");
            return;
        }

        if (!window.confirm("¿Seguro que deseas eliminar este grupo? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("✅ Grupo eliminado correctamente.");
            fetchGroups();
        } catch (error) {
            console.error("❌ Error al eliminar grupo:", error);
            alert("❌ No se pudo eliminar el grupo.");
        }
    };

    return (
        <div className="container">
            <h1>👥 Gestión de Grupos</h1>

            {/* 📌 Crear un nuevo grupo */}
            <div className="form-container">
                <h2>Crear Nuevo Grupo</h2>
                <form onSubmit={handleCreateGroup}>
                    <input
                        type="text"
                        placeholder="Nombre del grupo"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        required
                    />
                    <button type="submit">Crear Grupo</button>
                </form>
            </div>

            {/* 📌 Lista de Grupos */}
            <h2>📋 Lista de Grupos</h2>
            {groups.length === 0 ? (
                <p>⚠️ No hay grupos creados.</p>
            ) : (
                <ul>
                    {groups.map((group) => (
                        <li key={group.id}>
                            {group.name}{" "}
                            <button onClick={() => fetchGroupMembers(group.id)}>👀 Ver Miembros</button>
                            
                            {/* 📌 Botón para eliminar grupo */}
                            {group.created_by === user.id && (
                                <button 
                                    onClick={() => handleDeleteGroup(group.id, group.created_by)} 
                                    className="delete-btn"
                                >
                                    🗑️ Eliminar
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* 📌 Agregar Usuario a Grupo */}
            <h2>➕ Agregar Usuario a Grupo</h2>
            <select onChange={(e) => setSelectedGroup(groups.find(g => g.id === parseInt(e.target.value)))}>
                <option value="">Selecciona un grupo</option>
                {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                        {group.name}
                    </option>
                ))}
            </select>

            <select onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">Selecciona un usuario</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                    </option>
                ))}
            </select>

            <button onClick={handleAddUserToGroup}>Agregar Usuario</button>

            {/* 📌 Mostrar Miembros del Grupo */}
            {selectedGroup && selectedGroup.members && (
                <div>
                    <h2>👥 Miembros del Grupo: {selectedGroup.name}</h2>
                    {selectedGroup.members.length === 0 ? (
                        <p>⚠️ No hay miembros en este grupo.</p>
                    ) : (
                        <ul>
                            {selectedGroup.members.map((member) => (
                                <li key={member.id}>
                                    {member.name} ({member.email})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default ManageGroups;
