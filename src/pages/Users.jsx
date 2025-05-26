import { useEffect, useState } from "react";
import axios from "axios";

function Users() {
    const [users, setUsers] = useState([]);
    const [roleUpdate, setRoleUpdate] = useState({});
    
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(res.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    const handleRoleChange = (userId, role) => {
        setRoleUpdate({ ...roleUpdate, [userId]: role });
    };

    const updateUserRole = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_API_URL}/users/update-role`, 
                { userId, role: roleUpdate[userId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Rol actualizado");
            fetchUsers();
        } catch (error) {
            console.error("Error al actualizar rol:", error);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Usuario eliminado");
            fetchUsers();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    };

    return (
        <div className="container">
            <h1>Gestión de Usuarios</h1>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <select 
                                    value={roleUpdate[user.id] || user.role} 
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </td>
                            <td>
                                <button onClick={() => updateUserRole(user.id)}>Actualizar Rol</button>
                                <button onClick={() => deleteUser(user.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Users;
