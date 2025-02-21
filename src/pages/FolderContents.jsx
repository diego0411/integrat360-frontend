import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

function FolderContents() {
    const { folderId } = useParams();
    const [subfolders, setSubfolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allFolders, setAllFolders] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [moving, setMoving] = useState(false);

    useEffect(() => {
        loadFolderData();
    }, [folderId]);

    // 📌 Cargar carpetas y documentos
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

            // 🔍 Verificar si foldersRes.data es un array o un objeto
            let foldersArray = [];
            if (Array.isArray(foldersRes.data)) {
                foldersArray = foldersRes.data;
            } else if (foldersRes.data?.ownFolders) {
                foldersArray = [...foldersRes.data.ownFolders, ...(foldersRes.data.sharedFolders || [])];
            }

            console.log("📁 Lista de todas las carpetas disponibles:", foldersArray);

            setAllFolders(foldersArray);
            console.log("✅ Estado actualizado: allFolders =", foldersArray);

        } catch (error) {
            console.error("❌ Error al cargar contenido de la carpeta:", error);
        } finally {
            setLoading(false);
        }
    };

    // 📂 Mover subcarpeta a otra carpeta
    const moveSubfolder = async (subfolderId, newParentId) => {
        if (!subfolderId || !newParentId || newParentId === folderId) {
            alert("⚠️ Debes seleccionar una nueva carpeta diferente.");
            return;
        }

        try {
            setMoving(true);
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
        } finally {
            setMoving(false);
        }
    };

    // 📤 Subir archivos a una subcarpeta
    const uploadFile = async (event, targetFolderId) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", targetFolderId);

        try {
            setUploading(true);
            const token = localStorage.getItem("token");

            console.log(`📤 Subiendo archivo a la carpeta ID: ${targetFolderId}`);

            await axios.post(`${import.meta.env.VITE_API_URL}/documents`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });

            alert("✅ Archivo subido correctamente.");
            loadFolderData();
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error);
            alert("❌ No se pudo subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="folder-contents" style={{ backgroundColor: "#fff", minHeight: "100vh", padding: "20px" }}>
            <h2>📁 Contenido de la Carpeta</h2>

            {loading ? <p>Cargando...</p> : (
                <>
                    <h3>📂 Subcarpetas</h3>
                    <ul>
                        {subfolders.length === 0 ? (
                            <p>No hay subcarpetas.</p>
                        ) : (
                            subfolders.map(folder => (
                                <li key={folder.id}>
                                    <Link to={`/folder/${folder.id}`}>{folder.name}</Link>

                                    {/* 🆕 Input para subir archivos a la subcarpeta */}
                                    <label style={{ marginLeft: "10px", fontSize: "12px" }}>
                                        📤 Subir archivo
                                        <input
                                            type="file"
                                            onChange={(e) => uploadFile(e, folder.id)}
                                            disabled={uploading}
                                            style={{
                                                display: "none"
                                            }}
                                        />
                                    </label>

                                    {/* Opción para mover subcarpeta */}
                                    <select
                                        onChange={(e) => moveSubfolder(folder.id, e.target.value)}
                                        disabled={moving}
                                        style={{
                                            marginLeft: "10px",
                                            fontSize: "12px",
                                            padding: "3px",
                                            background: moving ? "#ddd" : "#fff",
                                            cursor: moving ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        <option value="">Mover a...</option>
                                        {allFolders.length > 0 ? (
                                            allFolders
                                                .filter(parent => parent.id !== folderId) // Evitar mover a sí misma
                                                .map(parent => (
                                                    <option key={parent.id} value={parent.id}>
                                                        {parent.name}
                                                    </option>
                                                ))
                                        ) : (
                                            <option disabled>No hay carpetas disponibles</option>
                                        )}
                                    </select>
                                </li>
                            ))
                        )}
                    </ul>

                    <h3>📄 Documentos</h3>
                    <ul>
                        {documents.length === 0 ? (
                            <p>No hay documentos.</p>
                        ) : (
                            documents.map(doc => (
                                <li key={doc.id}>
                                    <button
                                        onClick={() => downloadFile(doc.id, doc.name)}
                                        style={{
                                            fontSize: "12px",
                                            padding: "5px"
                                        }}
                                    >
                                        📥 Descargar {doc.name}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </>
            )}
        </div>
    );
}

export default FolderContents;
