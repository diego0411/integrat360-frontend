import { useEffect, useState } from "react";
import axios from "axios";
import { FaFolder, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function FoldersProyectos() {
    const navigate = useNavigate();
    const [projectFolders, setProjectFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProjectFolders();
    }, []);

    // 📌 Obtener carpetas del área "proyectos"
    const fetchProjectFolders = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders/projects`);
            if (res.status === 200) {
                setProjectFolders(res.data.projectFolders || []);
            } else {
                console.warn("⚠️ Respuesta inesperada al obtener carpetas de proyectos:", res);
            }
        } catch (error) {
            console.error("❌ Error al obtener carpetas de proyectos:", error);
            setProjectFolders([]);  // Evita valores undefined
        } finally {
            setLoading(false);
        }
    };

    // 📤 Subir archivo a la carpeta seleccionada
    const handleFileUpload = async () => {
        if (!file || !selectedFolder) {
            return alert("⚠️ Selecciona un archivo y una carpeta antes de subir.");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", selectedFolder);

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/documents`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });

            console.log("✅ Archivo subido correctamente:", res.data);
            setFile(null);
            setSelectedFolder(null);
            alert("✅ Archivo subido correctamente.");
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error.response?.data || error.message);
            alert("❌ Error al subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="folders-container">
            <h1>📁 Gestion de Carpetas de Proyectos</h1>

            <div className="folders-grid">
                {loading ? <p>Cargando carpetas...</p> : (
                    projectFolders.length === 0 ? <p>No hay carpetas de proyectos disponibles.</p> :
                    projectFolders.map(folder => (
                        <div key={folder.id} className="folder-card">
                            <div 
                                className="folder-content" 
                                onClick={() => navigate(`/folder/${folder.id}`)}
                            >
                                <FaFolder className="folder-icon" />
                                <p className="folder-name">{folder.name}</p>
                            </div>
                            {/* 📤 Botón para subir archivo a la carpeta */}
                            <FaUpload 
                                className="upload-icon" 
                                onClick={() => setSelectedFolder(folder.id)} 
                            />
                        </div>
                    ))
                )}
            </div>

            {/* 📤 Sección de Subida de Archivos */}
            {selectedFolder && (
                <div className="upload-section">
                    <h2>📤 Subir Archivo</h2>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <button onClick={handleFileUpload} disabled={uploading}>
                        {uploading ? "Subiendo..." : "Subir"}
                    </button>
                    <button onClick={() => setSelectedFolder(null)}>Cancelar</button>
                </div>
            )}
        </div>
    );
}

export default FoldersProyectos;
