import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa"; // Íconos para los botones

function ManageUsers() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user", birthdate: "" });
    const [editUserId, setEditUserId] = useState(null);

    useEffect(() => {
        if (user?.role !== "admin") {
            navigate("/");
        } else {
            fetchUsers();
        }
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            console.log("📌 Solicitando usuarios...");
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
            console.log("✅ Usuarios recibidos:", res.data);
        } catch (error) {
            console.error("❌ Error al obtener usuarios:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterOrEdit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (editUserId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/users/${editUserId}`, newUser, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("✅ Usuario actualizado:", newUser);
                alert("✅ Usuario actualizado correctamente.");
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, newUser);
                console.log("✅ Usuario registrado:", newUser);
                alert("✅ Usuario registrado correctamente.");
            }
            setNewUser({ name: "", email: "", password: "", role: "user", birthdate: "" });
            setEditUserId(null);
            fetchUsers();
        } catch (error) {
            console.error("❌ Error al registrar/actualizar usuario:", error.response?.data || error.message);
        }
    };

    const handleEdit = (user) => {
        setNewUser({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            birthdate: user.birthdate,
        });
        setEditUserId(user.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(user => user.id !== id));
            console.log("🗑️ Usuario eliminado");
            alert("✅ Usuario eliminado correctamente.");
        } catch (error) {
            console.error("❌ Error al eliminar usuario:", error.response?.data || error.message);
        }
    };

    return (
        <div className="container">
            <h1>👥 Gestión de Usuarios</h1>

            {/* 📌 Formulario de Registro y Edición (Reducido en tamaño) */}
            <div className="form-container small-form">
                <h2>{editUserId ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h2>
                <form onSubmit={handleRegisterOrEdit}>
                    <input type="text" placeholder="Nombre" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
                    <input type="email" placeholder="Correo" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                    {!editUserId && <input type="password" placeholder="Contraseña" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />}
                    <input type="date" placeholder="Fecha de Nacimiento" value={newUser.birthdate} onChange={(e) => setNewUser({ ...newUser, birthdate: e.target.value })} required />
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                    <button type="submit">{editUserId ? "Actualizar" : "Registrar"}</button>
                    {editUserId && <button type="button" onClick={() => { setEditUserId(null); setNewUser({ name: "", email: "", password: "", role: "user", birthdate: "" }) }}>Cancelar</button>}
                </form>
            </div>

            {/* 📌 Lista de Usuarios en formato GRID con tarjetas más pequeñas */}
            {loading ? <p>Cargando usuarios...</p> : (
                <div className="user-grid">
                    {users.map(user => (
                        <div key={user.id} className="user-card small-card">
                            <p><strong>{user.name}</strong></p>
                            <p>{user.email}</p>
                            <div className="actions">
                                <button className="icon-btn edit-btn" onClick={() => handleEdit(user)}><FaEdit /></button>
                                <button className="icon-btn delete-btn" onClick={() => handleDelete(user.id)}><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
