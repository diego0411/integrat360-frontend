import { useEffect, useState } from "react";
import axios from "axios";
import { FaFolder, FaTrash, FaShare } from "react-icons/fa";
import "../styles/folders.css";

function Folders({ onFolderSelect }) {
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
            <h1>📂 Gestión de Carpetas</h1>

            {/* 📌 CREAR CARPETA */}
            <div className="folder-create">
                <input 
                    type="text" 
                    placeholder="Nombre de la carpeta" 
                    value={newFolderName} 
                    onChange={(e) => setNewFolderName(e.target.value)} 
                />
                <button onClick={createFolder}>Crear Carpeta</button>
            </div>

            {/* 📌 LISTA DE CARPETAS PROPIAS Y COMPARTIDAS */}
            <div className="folders-container">
                {[...folders.ownFolders, ...folders.sharedFolders].map(folder => (
                    <div key={folder.id} className="folder-item" onClick={() => onFolderSelect(folder.id)}>
                        <FaFolder className="folder-icon" />
                        <span className="folder-name">{folder.name}</span>
                        <div className="folder-actions">
                            <button onClick={() => deleteFolder(folder.id)} className="delete-btn">
                                <FaTrash />
                            </button>
                            <button onClick={() => setSelectedFolder(folder.id)} className="share-btn">
                                <FaShare />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 📌 COMPARTIR CARPETA */}
            <div className="folder-share">
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
        </div>
    );
}

export default Folders;
