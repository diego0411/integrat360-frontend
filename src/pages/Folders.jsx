import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaShare, FaFolder, FaPlus, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Folders() {
    const navigate = useNavigate();
    const [folders, setFolders] = useState({ ownFolders: [], sharedFolders: [], sharedGroupFolders: [] });
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [uploading, setUploading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchFolders();
        fetchUsers();
        fetchGroups();
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

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data || []);
        } catch (error) {
            console.error("❌ Error al obtener usuarios:", error);
        }
    };

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(res.data || []);
        } catch (error) {
            console.error("❌ Error al obtener grupos:", error);
        }
    };

    const createFolder = async () => {
        if (!newFolderName.trim()) {
            alert("⚠️ El nombre de la carpeta es obligatorio");
            return;
        }

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
        if (!window.confirm("⚠️ ¿Estás seguro de que quieres eliminar esta carpeta? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            setDeleting(true);
            const token = localStorage.getItem("token");

            console.log(`🗑️ Eliminando carpeta ID: ${folderId}`);

            await axios.delete(`${import.meta.env.VITE_API_URL}/folders/${folderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("✅ Carpeta eliminada correctamente.");
            fetchFolders();
        } catch (error) {
            console.error("❌ Error al eliminar la carpeta:", error);
            alert("❌ No se pudo eliminar la carpeta.");
        } finally {
            setDeleting(false);
        }
    };

    const handleFileUpload = async (event, folderId) => {
        const file = event.target.files[0];
        if (!file || !folderId) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", folderId);

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/documents`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });

            alert("✅ Archivo subido correctamente.");
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error);
            alert("❌ Error al subir el archivo.");
        } finally {
            setUploading(false);
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
            <div className="folders-grid">
                {loading ? (
                    <p>Cargando carpetas...</p>
                ) : (
                    folders.ownFolders.concat(folders.sharedFolders, folders.sharedGroupFolders).map((folder, index) => 
                        folder && (
                            <div key={`${folder.id}-${index}`} className="folder-card">
                                <div onClick={() => navigate(`/folder/${folder.id}`)}>
                                    <FaFolder className="folder-icon" />
                                    <p className="folder-name">{folder.name || "Sin nombre"}</p>
                                </div>
                                <div className="folder-actions">
                                    <label>
                                        <input 
                                            type="file" 
                                            style={{ display: "none" }} 
                                            onChange={(e) => handleFileUpload(e, folder.id)} 
                                        />
                                        <FaUpload className="upload-icon" title="Subir archivo" />
                                    </label>
                                    <FaShare 
                                        className="share-icon" 
                                        title="Compartir" 
                                        onClick={() => {
                                            setSelectedFolder(folder.id);
                                            setShowShareModal(true);
                                        }} 
                                    />
                                    <FaTrash 
                                        className="delete-icon" 
                                        title="Eliminar" 
                                        onClick={() => deleteFolder(folder.id)}
                                        style={{ cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.5 : 1 }}
                                    />
                                </div>
                            </div>
                        )
                    )
                )}
            </div>
        </div>
    );
}

export default Folders;
