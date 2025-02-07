import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaShare } from "react-icons/fa";

function Folders() {
    const [folders, setFolders] = useState({ ownFolders: [], sharedFolders: [] });
    const [newFolderName, setNewFolderName] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState("");
    const [selectedUser, setSelectedUser] = useState("");

    useEffect(() => {
        fetchFolders();
        fetchUsers();
    }, []);

    const fetchFolders = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFolders(res.data);
        } catch (error) {
            console.error("Error al obtener carpetas:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    const createFolder = async () => {
        if (!newFolderName) return alert("El nombre de la carpeta es obligatorio");

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/folders`, { name: newFolderName }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewFolderName("");
            fetchFolders();
        } catch (error) {
            console.error("Error al crear la carpeta:", error);
        }
    };

    const deleteFolder = async (folderId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta carpeta?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/folders/${folderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFolders();
        } catch (error) {
            console.error("Error al eliminar la carpeta:", error);
        }
    };

    const shareFolder = async () => {
        if (!selectedFolder || !selectedUser) return alert("Selecciona una carpeta y un usuario");

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/folders/share`, 
                { folderId: selectedFolder, userId: selectedUser }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Carpeta compartida exitosamente");
            fetchFolders();
        } catch (error) {
            console.error("Error al compartir la carpeta:", error);
        }
    };

    return (
        <div>
            <h1>Gestión de Carpetas</h1>

            {/* CREAR CARPETA */}
            <h2>Crear Nueva Carpeta</h2>
            <input type="text" placeholder="Nombre de la carpeta" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
            <button onClick={createFolder}>Crear Carpeta</button>

            {/* LISTA DE CARPETAS PROPIAS */}
            <h2>Carpetas Propias</h2>
            <ul>
                {folders.ownFolders.map(folder => (
                    <li key={folder.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "300px", padding: "5px", borderBottom: "1px solid #ddd" }}>
                        <span>{folder.name}</span>
                        <div>
                            <button onClick={() => deleteFolder(folder.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "red", marginRight: "10px" }}>
                                <FaTrash />
                            </button>
                            <button onClick={() => setSelectedFolder(folder.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "blue" }}>
                                <FaShare />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* LISTA DE CARPETAS COMPARTIDAS */}
            <h2>Carpetas Compartidas Contigo</h2>
            <ul>
                {folders.sharedFolders.map(folder => (
                    <li key={folder.id} style={{ width: "300px", padding: "5px", borderBottom: "1px solid #ddd" }}>
                        {folder.name}
                    </li>
                ))}
            </ul>

            {/* COMPARTIR CARPETA */}
            <h2>Compartir Carpeta</h2>
            <label>Selecciona una Carpeta:</label>
            <select onChange={(e) => setSelectedFolder(e.target.value)} value={selectedFolder}>
                <option value="">Selecciona una carpeta</option>
                {folders.ownFolders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
            </select>

            <label>Selecciona un Usuario:</label>
            <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
                <option value="">Selecciona un usuario</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} - {user.email}</option>
                ))}
            </select>

            <button onClick={shareFolder}>Compartir Carpeta</button>
        </div>
    );
}

export default Folders;
