import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaShare, FaFolder, FaPlus, FaUpload, FaEye, FaDownload } from "react-icons/fa";
import DocumentViewer from "../components/DocumentViewer";
import { useNavigate } from "react-router-dom";

function Folders() {
    const navigate = useNavigate();
    const [folders, setFolders] = useState({ ownFolders: [], sharedFolders: [], sharedGroupFolders: [] });
    const [newFolderName, setNewFolderName] = useState("");
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
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

            if (res.status === 200) {
                setUsers(res.data || []);
            }
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

            if (res.status === 200) {
                setGroups(res.data || []);
            }
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

    const shareFolder = async () => {
        if (!showShareSection || (!selectedUser && !selectedGroup)) {
            return alert("⚠️ Selecciona un usuario o un grupo para compartir");
        }

        try {
            const token = localStorage.getItem("token");
            if (selectedUser) {
                await axios.post(`${import.meta.env.VITE_API_URL}/folders/share`, 
                    { folderId: showShareSection, userId: selectedUser }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } 
            if (selectedGroup) {
                await axios.post(`${import.meta.env.VITE_API_URL}/folders/share/group`, 
                    { folderId: showShareSection, groupId: selectedGroup }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert("✅ Carpeta compartida exitosamente");
            fetchFolders();
            setShowShareSection(null);
            setSelectedUser(""); // Resetear usuario seleccionado
            setSelectedGroup(""); // Resetear grupo seleccionado
        } catch (error) {
            console.error("❌ Error al compartir la carpeta:", error);
        }
    };

    const handleFileUpload = async () => {
        if (!file || !showUploadSection) {
            return alert("⚠️ Selecciona un archivo y una carpeta antes de subir.");
        }
    
        const folderId = Number(showUploadSection);
        if (isNaN(folderId)) {
            return alert("⚠️ El ID de la carpeta no es válido.");
        }
    
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", folderId);
    
        try {
            const token = localStorage.getItem("token");
            console.log("📤 Subiendo archivo:", file.name, "📂 Carpeta ID:", folderId);
    
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/documents/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
    
            console.log("✅ Archivo subido correctamente:", res.data);
            setFile(null);
            setShowUploadSection(null);
            fetchFolders();
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error.response?.data || error.message);
            alert("❌ Error al subir el archivo. Revisa la consola para más detalles.");
        }
    };
    
    const handleDeleteFolder = async (event, folderId) => {
        event.stopPropagation(); // Evita que el evento burbujee
        
        console.log("🗑️ Eliminando carpeta con ID:", folderId);
    
        if (!folderId) {
            console.error("⚠️ Error: folderId es undefined o null.");
            return;
        }
    
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta carpeta?");
        if (!confirmDelete) return;
    
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/folders/${folderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            console.log("✅ Respuesta del servidor:", response.data);
            alert("✅ Carpeta eliminada correctamente");
            fetchFolders(); // Actualizar lista de carpetas
        } catch (error) {
            console.error("❌ Error al eliminar la carpeta:", error.response?.data || error.message);
            alert(`❌ Error al eliminar la carpeta: ${error.response?.data?.error || error.message}`);
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
                    folders.ownFolders.concat(folders.sharedFolders, folders.sharedGroupFolders).map((folder, index) => (
                        <div key={`${folder.id}-${index}`} className="folder-card">
                            <div  key={`${folder.id}-${index}`} 
                className="folder-card"
                onClick={() => navigate(`/folder/${folder.id}`)} // 👈 Navegar al contenido de la carpeta
            >
                                <FaFolder className="folder-icon" />
                                <p className="folder-name">{folder.name}</p>
                            </div>
                            <div className="folder-actions">
                                <FaUpload className="upload-icon" onClick={() => setShowUploadSection(folder.id)} />
                                <FaShare className="share-icon" onClick={() => setShowShareSection(folder.id)} />
                                <FaTrash 
    className="delete-icon" 
    onClick={(event) => handleDeleteFolder(event, folder.id)} 
/>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 📌 Sección de subida de archivos */}
            {showUploadSection && (
                <div className="upload-section">
                    <h2>📤 Subir Archivo</h2>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <button onClick={handleFileUpload}>Subir</button>
                    <button onClick={() => setShowUploadSection(null)}>Cancelar</button>
                </div>
            )}

            {/* 📌 Compartir carpeta con usuario o grupo */}
            {showShareSection && (
                <div className="share-section">
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
                    <button onClick={() => setShowShareSection(null)}>Cancelar</button>
                </div>
            )}
        </div>
    );
}

export default Folders;
