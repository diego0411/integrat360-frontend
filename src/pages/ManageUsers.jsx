import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ManageUsers() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user", birthdate: "" });
    const [editUser, setEditUser] = useState(null);

    // 🔄 Redirigir si el usuario no es admin
    useEffect(() => {
        if (user?.role !== "admin") {
            navigate("/");
        } else {
            fetchUsers();
        }
    }, [user, navigate]);

    // 📌 Obtener usuarios
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

    // 📌 Registrar usuario
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, newUser);
            console.log("✅ Usuario registrado:", response.data);
            setNewUser({ name: "", email: "", password: "", role: "user", birthdate: "" });
            fetchUsers();
            alert("✅ Usuario registrado correctamente.");
        } catch (error) {
            console.error("❌ Error al registrar usuario:", error.response?.data || error.message);
        }
    };

    // 📌 Editar usuario
    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_API_URL}/users/${editUser.id}`, editUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("✅ Usuario actualizado:", editUser);
            setEditUser(null);
            fetchUsers();
            alert("✅ Usuario actualizado correctamente.");
        } catch (error) {
            console.error("❌ Error al actualizar usuario:", error.response?.data || error.message);
        }
    };

    // 📌 Eliminar usuario
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
            
            {/* 📌 Formulario de Registro */}
            <div className="form-container">
                <h2>Registrar Nuevo Usuario</h2>
                <form onSubmit={handleRegister}>
                    <input type="text" placeholder="Nombre" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
                    <input type="email" placeholder="Correo" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                    <input type="password" placeholder="Contraseña" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
                    <input type="date" placeholder="Fecha de Nacimiento" value={newUser.birthdate} onChange={(e) => setNewUser({ ...newUser, birthdate: e.target.value })} required />
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                    <button type="submit">Registrar</button>
                </form>
            </div>

            {/* 📌 Tabla de Usuarios */}
            {loading ? <p>Cargando usuarios...</p> : (
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Fecha de Nacimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.birthdate || "No especificado"}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => setEditUser(user)}>✏️ Editar</button>
                                    <button className="delete-btn" onClick={() => handleDelete(user.id)}>🗑️ Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* 📌 Formulario de Edición */}
            {editUser && (
                <div className="form-container">
                    <h2>Editar Usuario</h2>
                    <form onSubmit={handleEdit}>
                        <input type="text" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} required />
                        <input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} required />
                        <input type="date" value={editUser.birthdate} onChange={(e) => setEditUser({ ...editUser, birthdate: e.target.value })} required />
                        <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <button type="submit">Actualizar</button>
                        <button type="button" onClick={() => setEditUser(null)}>Cancelar</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
