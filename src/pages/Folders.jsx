import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaShare, FaFolder, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Folders() {
    const navigate = useNavigate();
    const [folders, setFolders] = useState({ ownFolders: [], sharedFolders: [], sharedGroupFolders: [] });
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState("");
    const [recipientType, setRecipientType] = useState("user");
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFolders({
                ownFolders: res.data.ownFolders || [],
                sharedFolders: res.data.sharedFolders || [],
                sharedGroupFolders: res.data.sharedGroupFolders || [],
            });
        } catch (error) {
            console.error("❌ Error al obtener carpetas:", error);
        } finally {
            setLoading(false);
        }
    };

    const createFolder = async () => {
        if (!newFolderName.trim()) return alert("⚠️ El nombre de la carpeta es obligatorio");

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/folders`, { name: newFolderName }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewFolderName("");
            fetchFolders();
            alert("✅ Carpeta creada correctamente");
        } catch (error) {
            console.error("❌ Error al crear carpeta:", error);
        }
    };

    const deleteFolder = async (folderId) => {
        if (!folderId || !window.confirm("⚠️ ¿Estás seguro de eliminar esta carpeta?")) return;

        try {
            setDeleting(true);
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/folders/${folderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFolders();
            alert("✅ Carpeta eliminada correctamente.");
        } catch (error) {
            console.error("❌ Error al eliminar la carpeta:", error);
            alert(`❌ No se pudo eliminar la carpeta: ${error.response?.data?.error || "Error desconocido"}`);
        } finally {
            setDeleting(false);
        }
    };

    const fetchUsersAndGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            const [usersRes, groupsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${import.meta.env.VITE_API_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setUsers(usersRes.data);
            setGroups(groupsRes.data);
        } catch (error) {
            console.error("❌ Error al obtener usuarios y grupos:", error);
        }
    };

    const shareFolder = async () => {
        if (!selectedFolder || !selectedRecipient) return alert("⚠️ Selecciona un usuario o grupo válido.");

        try {
            const token = localStorage.getItem("token");
            const endpoint = recipientType === "user" ? "/folders/share" : "/folders/share/group";
            const body = recipientType === "user" 
                ? { folderId: selectedFolder, userId: selectedRecipient } 
                : { folderId: selectedFolder, groupId: selectedRecipient };

            await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("✅ Carpeta compartida exitosamente.");
            setShowShareModal(false);
            setSelectedRecipient("");
        } catch (error) {
            console.error("❌ Error al compartir la carpeta:", error);
            alert(`❌ No se pudo compartir la carpeta: ${error.response?.data?.error || "Error desconocido"}`);
        }
    };

    return (
        <div className="folders-container">
            <h1>📂 Gestión Documental</h1>
            <div className="folder-form">
                <input
                    type="text"
                    placeholder="Nombre de la carpeta"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                />
                <button onClick={createFolder} className="create-folder-btn">
                    <FaPlus /> Crear Carpeta
                </button>
            </div>

            <h2>📂 Mis Carpetas</h2>
            <div className="folders-list">
                {loading ? (
                    <p className="loading-text">Cargando carpetas...</p>
                ) : (
                    <ul className="folder-list">
                        {folders.ownFolders.concat(folders.sharedFolders, folders.sharedGroupFolders).map((folder, index) => (
                            <li key={`${folder.id}-${index}`} className="folder-item" onClick={() => navigate(`/folder/${folder.id}`)}>
                                <FaFolder className="folder-icon" />
                                <span className="folder-name">{folder.name || "Sin nombre"}</span>
                                <div className="folder-actions">
                                    <FaShare 
                                        className="share-icon" 
                                        title="Compartir"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFolder(folder.id);
                                            setShowShareModal(true);
                                            fetchUsersAndGroups();
                                        }}
                                    />
                                    <FaTrash 
                                        className="delete-icon" 
                                        title="Eliminar" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteFolder(folder.id);
                                        }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showShareModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Compartir Carpeta</h3>
                        <select value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
                            <option value="user">Usuario</option>
                            <option value="group">Grupo</option>
                        </select>
                        <select value={selectedRecipient} onChange={(e) => setSelectedRecipient(e.target.value)}>
                            {(recipientType === "user" ? users : groups).map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                        <button className="btn-primary" onClick={shareFolder}>Compartir</button>
                        <button className="btn-cancel" onClick={() => setShowShareModal(false)}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Folders;
