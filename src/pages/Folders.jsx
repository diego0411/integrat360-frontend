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

    const shareFolder = async () => {
        if (!selectedFolder || (!selectedUser && !selectedGroup)) {
            return alert("⚠️ Selecciona una carpeta y un usuario o grupo para compartir.");
        }

        try {
            const token = localStorage.getItem("token");

            if (selectedUser) {
                await axios.post(`${import.meta.env.VITE_API_URL}/folders/share`, 
                    { folderId: selectedFolder, userId: selectedUser }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            if (selectedGroup) {
                await axios.post(`${import.meta.env.VITE_API_URL}/folders/share/group`, 
                    { folderId: selectedFolder, groupId: selectedGroup }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert("✅ Carpeta compartida correctamente.");
            setShowShareModal(false);
            setSelectedFolder(null);
            setSelectedUser("");
            setSelectedGroup("");
        } catch (error) {
            console.error("❌ Error al compartir la carpeta:", error);
        }
    };

    return (
        <div className="folders-container">
            <h1>📂 Gestión de Carpetas</h1>

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
                                    <FaTrash className="delete-icon" title="Eliminar" />
                                </div>
                            </div>
                        )
                    )
                )}
            </div>

            {showShareModal && (
                <div className="modal">
                    <h2>📤 Compartir Carpeta</h2>
                    <label>Selecciona un usuario:</label>
                    <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
                        <option value="">Selecciona un usuario</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>

                    <label>Selecciona un grupo:</label>
                    <select onChange={(e) => setSelectedGroup(e.target.value)} value={selectedGroup}>
                        <option value="">Selecciona un grupo</option>
                        {groups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>

                    <button onClick={shareFolder}>Compartir</button>
                    <button onClick={() => setShowShareModal(false)}>Cancelar</button>
                </div>
            )}
        </div>
    );
}

export default Folders;
