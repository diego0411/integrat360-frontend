import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { FaEye, FaTrash, FaTimes } from "react-icons/fa"; // Iconos para los botones

function ManageGroups() {
    const { user } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedUser, setSelectedUser] = useState("");
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

    useEffect(() => {
        fetchGroups();
        fetchUsers();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(response.data || []);
        } catch (error) {
            console.error("❌ Error al obtener grupos:", error.response?.data || error.message);
            setGroups([]);
        }
    };

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
            setShowCreateGroup(false);
            fetchGroups();
            alert("✅ Grupo creado exitosamente.");
        } catch (error) {
            console.error("❌ Error al crear grupo:", error);
        }
    };

    const fetchGroupMembers = async (group) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${group.id}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSelectedGroup({ ...group, members: res.data });
            setShowAddMember(false);
        } catch (error) {
            console.error("❌ Error al obtener miembros del grupo:", error);
        }
    };

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

            fetchGroupMembers(selectedGroup);
            setSelectedUser("");
            setShowAddMember(false);
            alert("✅ Usuario agregado correctamente al grupo.");
        } catch (error) {
            console.error("❌ Error al agregar usuario:", error);
        }
    };

    const handleRemoveUserFromGroup = async (userId) => {
        if (!selectedGroup) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/groups/${selectedGroup.id}/members/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchGroupMembers(selectedGroup);
            alert("✅ Usuario eliminado correctamente del grupo.");
        } catch (error) {
            console.error("❌ Error al eliminar usuario del grupo:", error);
        }
    };

    return (
        <div className="groups-container">
            {/* 📌 Tarjeta Lista de Grupos */}
            <div className="group-list">
                <button className="btn-primary" onClick={() => setShowCreateGroup(!showCreateGroup)}>
                    + Crear Grupo
                </button>

                {showCreateGroup && (
                    <div className="group-form">
                        <input
                            type="text"
                            placeholder="Nombre del grupo"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                        <button onClick={handleCreateGroup}>Crear</button>
                        <button className="btn-cancel" onClick={() => setShowCreateGroup(false)}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                )}

                <h2>📋 Lista de Grupos</h2>
                {groups.length === 0 ? (
                    <p>⚠️ No hay grupos creados.</p>
                ) : (
                    <ul>
                        {groups.map((group) => (
                            <li key={group.id}>
                                {group.name}{" "}
                                <button className="btn-view" onClick={() => fetchGroupMembers(group)}>
                                    <FaEye />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 📌 Tarjeta Miembros del Grupo (solo si hay un grupo seleccionado) */}
            {selectedGroup && (
                <div className="group-members">
                    <button className="btn-cancel close-btn" onClick={() => setSelectedGroup(null)}>
                        <FaTimes /> Cerrar
                    </button>

                    <button className="btn-primary" onClick={() => setShowAddMember(!showAddMember)}>
                        👥 Agregar Miembro
                    </button>

                    {showAddMember && (
                        <div className="group-form">
                            <select onChange={(e) => setSelectedUser(e.target.value)}>
                                <option value="">Selecciona un usuario</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            <button onClick={handleAddUserToGroup}>Agregar</button>
                            <button className="btn-cancel" onClick={() => setShowAddMember(false)}>
                                <FaTimes /> Cancelar
                            </button>
                        </div>
                    )}

                    <h2>👥 Miembros: {selectedGroup.name}</h2>
                    {selectedGroup.members.length === 0 ? (
                        <p>⚠️ No hay miembros en este grupo.</p>
                    ) : (
                        <ul>
                            {selectedGroup.members.map((member) => (
                                <li key={member.id}>
                                    {member.name} ({member.email}){" "}
                                    <button className="btn-delete" onClick={() => handleRemoveUserFromGroup(member.id)}>
                                        <FaTrash />
                                    </button>
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
