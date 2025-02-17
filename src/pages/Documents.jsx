import { useEffect, useState } from "react";
import axios from "axios";

function Documents() {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [folders, setFolders] = useState([]);
    const [folderId, setFolderId] = useState("");
    const downloadUrl = `${import.meta.env.VITE_API_URL}/documents/download/${doc.id}`;


    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (folderId) fetchDocuments();
    }, [folderId]);

    // 📌 Obtener carpetas
    const fetchFolders = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.ownFolders && res.data.sharedFolders) {
                setFolders([...res.data.ownFolders, ...res.data.sharedFolders]);
                console.log("📂 Carpetas cargadas:", res.data);
            } else {
                console.warn("⚠️ No hay carpetas disponibles.");
            }
        } catch (error) {
            console.error("❌ Error al obtener carpetas:", error);
        }
    };

    // 📌 Obtener documentos de una carpeta
    const fetchDocuments = async () => {
        if (!folderId) return;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/documents/${folderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.length > 0) {
                setDocuments(res.data);
                console.log("📄 Documentos cargados:", res.data);
            } else {
                setDocuments([]);
                console.warn("⚠️ No hay documentos en esta carpeta.");
            }
        } catch (error) {
            console.error("❌ Error al obtener documentos:", error);
        }
    };

    // 📌 Subir un archivo
    const handleUpload = async () => {
        if (!folderId || !file) {
            alert("Selecciona una carpeta y un archivo antes de subir.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", folderId);

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/documents/`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log("✅ Archivo subido correctamente");
            setFile(null);
            fetchDocuments();
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error);
        }
    };

    // 📌 Eliminar un archivo
    const handleDelete = async (docId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este documento?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/documents/${docId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("🗑️ Documento eliminado");
            fetchDocuments();
        } catch (error) {
            console.error("❌ Error al eliminar el documento:", error);
        }
    };

    return (
        <div>
            <h1>📂 Gestión de Documentos</h1>

            {/* 📌 Selección de Carpeta */}
            <label>Selecciona una Carpeta:</label>
            <select onChange={(e) => setFolderId(e.target.value)} value={folderId}>
                <option value="">Selecciona una carpeta</option>
                {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
            </select>

            {/* 📌 Subir Archivo */}
            <input type="file" onChange={(e) => setFile(e.target.files[0])} disabled={!folderId} />
            <button onClick={handleUpload} disabled={!folderId || !file}>Subir Archivo</button>

            {/* 📌 Lista de Documentos */}
            <h2>📄 Documentos en la Carpeta</h2>
            {documents.length === 0 ? (
                <p>⚠️ No hay documentos en esta carpeta.</p>
            ) : (
                <ul>
                    {documents.map(doc => {
                        const downloadUrl = `${import.meta.env.VITE_API_URL}/uploads/${doc.filename}`;
                        return (
                            <li key={doc.id}>
                                <a 
                                    href={downloadUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    download={doc.original_name}
                                >
                                    📄 {doc.original_name}
                                </a>
                                <button onClick={() => handleDelete(doc.id)}>🗑️ Eliminar</button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default Documents;
