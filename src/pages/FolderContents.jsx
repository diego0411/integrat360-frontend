import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

function FolderContents() {
    const { folderId } = useParams();
    const [subfolders, setSubfolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [newFolderName, setNewFolderName] = useState("");
    const [loading, setLoading] = useState(true);
    const [allFolders, setAllFolders] = useState([]);

    useEffect(() => {
        loadFolderData();
    }, [folderId]);

    const loadFolderData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("❌ No hay token de autenticación.");
                return;
            }

            const [contentRes, foldersRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/folders/${folderId}/contents`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/folders`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            console.log("📂 Contenido de la carpeta:", contentRes.data);
            console.log("🚀 Todas las carpetas recibidas:", foldersRes.data);

            setSubfolders(contentRes.data.subfolders || []);
            setDocuments(contentRes.data.documents || []);

            // 🔎 Verificar si la API devuelve un array válido
            const foldersArray = Array.isArray(foldersRes.data) ? foldersRes.data : [];
            console.log("📁 Lista de todas las carpetas:", foldersArray);

            setAllFolders(foldersArray);
            console.log("✅ Estado actualizado: allFolders =", foldersArray);

        } catch (error) {
            console.error("❌ Error al cargar contenido de la carpeta:", error);
        } finally {
            setLoading(false);
        }
    };

    const moveSubfolder = async (subfolderId, newParentId) => {
        if (!subfolderId || !newParentId || newParentId === folderId) {
            alert("⚠️ Debes seleccionar una nueva carpeta diferente.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            console.log(`📂 Moviendo subcarpeta ID: ${subfolderId} ➡️ Nueva carpeta: ${newParentId}`);

            await axios.put(`${import.meta.env.VITE_API_URL}/folders/move`, {
                folder_id: subfolderId,
                new_parent_id: newParentId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("✅ Carpeta movida correctamente.");
            loadFolderData();
        } catch (error) {
            console.error("❌ Error al mover la carpeta:", error);
            alert("❌ Error al mover la carpeta.");
        }
    };

    return (
        <div className="folder-contents" style={{ backgroundColor: "#fff", minHeight: "100vh", padding: "20px" }}>
            <h2>📁 Contenido de la Carpeta</h2>

            {loading ? <p>Cargando...</p> : (
                <>
                    <h3>📂 Subcarpetas</h3>
                    <ul>
                        {subfolders.length === 0 ? <p>No hay subcarpetas.</p> :
                            subfolders.map(folder => (
                                <li key={folder.id}>
                                    <Link to={`/folder/${folder.id}`}>{folder.name}</Link>
                                    <select
                                        onChange={(e) => moveSubfolder(folder.id, e.target.value)}
                                        style={{ marginLeft: "10px", fontSize: "12px", padding: "3px" }}
                                    >
                                        <option value="">Mover a...</option>
                                        {allFolders.length > 0 ? allFolders.map(parent => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name}
                                            </option>
                                        )) : <option disabled>No hay carpetas disponibles</option>}
                                    </select>
                                </li>
                            ))
                        }
                    </ul>

                    <h3>📄 Documentos</h3>
                    <ul>
                        {documents.length === 0 ? <p>No hay documentos.</p> :
                            documents.map(doc => (
                                <li key={doc.id}>
                                    <button
                                        onClick={() => downloadFile(doc.id, doc.name)}
                                        style={{ fontSize: "12px", padding: "5px" }}
                                    >
                                        📥 Descargar {doc.name}
                                    </button>
                                </li>
                            ))
                        }
                    </ul>
                </>
            )}
        </div>
    );
}

export default FolderContents;
