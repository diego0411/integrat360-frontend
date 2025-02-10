import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaShare, FaFolder, FaPlus, FaUpload, FaEye, FaDownload } from "react-icons/fa";
import DocumentViewer from "../components/DocumentViewer";
import "./src/styles/Folders.css";

function Folders() {
    const [folders, setFolders] = useState({ ownFolders: [], sharedFolders: [] });
    const [newFolderName, setNewFolderName] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [showShareSection, setShowShareSection] = useState(null);
    const [showUploadSection, setShowUploadSection] = useState(null);
    const [file, setFile] = useState(null);
    const [selectedFileUrl, setSelectedFileUrl] = useState(""); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFolders();
        fetchUsers();
    }, []);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.ownFolders && res.data.sharedFolders) {
                setFolders({
                    ownFolders: res.data.ownFolders,
                    sharedFolders: res.data.sharedFolders,
                });
            } else {
                setFolders({ ownFolders: [], sharedFolders: [] });
            }
        } catch (error) {
            console.error("❌ Error al obtener carpetas:", error);
        } finally {
            setLoading(false);
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
            console.error("❌ Error al obtener usuarios:", error);
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
            alert("✅ Carpeta creada correctamente");
        } catch (error) {
            console.error("❌ Error al crear carpeta:", error);
        }
    };

    const shareFolder = async () => {
        if (!selectedFolder || !selectedUser) return alert("Selecciona un usuario");

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/folders/share`, 
                { folderId: selectedFolder, userId: selectedUser }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("✅ Carpeta compartida exitosamente");
            fetchFolders();
            setShowShareSection(null);
        } catch (error) {
            console.error("❌ Error al compartir la carpeta:", error);
        }
    };

    const openFolder = async (folderId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/documents/${folderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedFolder(folderId);
            setDocuments(res.data);
        } catch (error) {
            console.error("❌ Error al abrir la carpeta:", error);
        }
    };

    const handleFileUpload = async () => {
        if (!file) return alert("Selecciona un archivo");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", showUploadSection);

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/documents/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("✅ Archivo subido correctamente");
            setFile(null);
            setShowUploadSection(null);
            openFolder(showUploadSection);
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error);
        }
    };

    const deleteDocument = async (docId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este documento?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/documents/${docId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("🗑️ Documento eliminado correctamente");
            openFolder(selectedFolder);
        } catch (error) {
            console.error("❌ Error al eliminar documento:", error);
        }
    };

    return (
        <div className="folders-container">
            <h1>📂 Gestión de Carpetas</h1>

            {/* 📌 Formulario para crear una carpeta */}
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

            {/* 📌 Mostrar carpetas */}
            <div className="folders-grid">
                {loading ? <p>Cargando carpetas...</p> : (
                    folders.ownFolders.concat(folders.sharedFolders).map(folder => (
                        <div key={folder.id} className="folder-card">
                            <div onClick={() => openFolder(folder.id)}>
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

            {/* 📌 Subir Archivos */}
            {showUploadSection && (
                <div className="upload-section">
                    <h2>📤 Subir Archivo</h2>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <button onClick={handleFileUpload}>Subir</button>
                    <button onClick={() => setShowUploadSection(null)}>Cancelar</button>
                </div>
            )}

            {/* 📌 Documentos dentro de la carpeta */}
            {selectedFolder && (
                <div className="documents-container">
                    <h2>📄 Documentos en la Carpeta</h2>
                    {documents.length === 0 ? (
                        <p>No hay documentos en esta carpeta.</p>
                    ) : (
                        <ul>
                            {documents.map(doc => {
                                const fileUrl = `${import.meta.env.VITE_API_URL}/uploads/${doc.filename}`;
                                return (
                                    <li key={doc.id}>
                                        <span>{doc.original_name}</span>
                                        <FaEye className="view-icon" onClick={() => setSelectedFileUrl(fileUrl)} />
                                        <a href={fileUrl} download>
                                            <FaDownload className="download-icon" />
                                        </a>
                                        <FaTrash className="delete-icon" onClick={() => deleteDocument(doc.id)} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* 📌 Visualizador de documentos */}
            {selectedFileUrl && <DocumentViewer fileUrl={selectedFileUrl} />}
        </div>
    );
}

export default Folders;
