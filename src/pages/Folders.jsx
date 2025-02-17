import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaShare, FaFolder, FaPlus, FaUpload } from "react-icons/fa";
import DocumentViewer from "../components/DocumentViewer";

function Folders() {
    const [folders, setFolders] = useState({ ownFolders: [], sharedFolders: [], sharedGroupFolders: [] });
    const [newFolderName, setNewFolderName] = useState("");
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [showShareSection, setShowShareSection] = useState(null);
    const [showUploadSection, setShowUploadSection] = useState(null);
    const [file, setFile] = useState(null);
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

            setFolders(res.data || { ownFolders: [], sharedFolders: [], sharedGroupFolders: [] });
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

            <div className="folders-grid">
                {loading ? <p>Cargando carpetas...</p> : (
                    [...(folders.ownFolders || []), ...(folders.sharedFolders || []), ...(folders.sharedGroupFolders || [])]
                        .map((folder, index) => (
                            <div key={`${folder.id}-${index}`} className="folder-card">
                                <div onClick={() => setShowShareSection(folder.id)}>
                                    <FaFolder className="folder-icon" />
                                    <p className="folder-name">{folder.name}</p>
                                </div>
                                <div className="folder-actions">
                                    <FaUpload className="upload-icon" onClick={() => setShowUploadSection(folder.id)} />
                                    <FaShare className="share-icon" onClick={() => setShowShareSection(folder.id)} />
                                    <FaTrash className="delete-icon" />
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}

export default Folders;
