import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

function FolderContents() {
    const { folderId } = useParams(); // 📌 Obtener el ID de la carpeta desde la URL
    const [subfolders, setSubfolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [newFolderName, setNewFolderName] = useState(""); // Estado para el nombre de la nueva subcarpeta
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContents();
    }, [folderId]);

    // 📌 Obtener contenido de la carpeta
    const fetchContents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders/${folderId}/contents`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                setSubfolders(res.data.subfolders || []);
                setDocuments(res.data.documents || []);
            } else {
                console.warn("⚠️ Respuesta inesperada al obtener contenidos.");
            }
        } catch (error) {
            console.error("❌ Error al obtener contenidos:", error);
        } finally {
            setLoading(false);
        }
    };

    // 📌 Función para descargar un documento
    const downloadFile = async (documentId, documentName) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/documents/download/${documentId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob", // 📥 Recibir como archivo binario
            });

            // 📌 Obtener nombre del archivo desde los headers (si está disponible)
            const contentDisposition = response.headers["content-disposition"];
            const suggestedFileName = contentDisposition ? contentDisposition.split("filename=")[1] : documentName;

            // 📥 Crear URL de descarga
            const url = URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.download = suggestedFileName || documentName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log("✅ Archivo descargado correctamente:", suggestedFileName);
        } catch (error) {
            console.error("❌ Error al descargar el archivo:", error);
            alert("❌ No se pudo descargar el archivo.");
        }
    };

    // 📌 Función para crear una subcarpeta dentro de la carpeta actual
    const createSubfolder = async () => {
        if (!newFolderName.trim()) {
            alert("⚠️ Ingresa un nombre para la subcarpeta.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/folders`, {
                name: newFolderName,
                parent_id: folderId, // 📂 Establecer la carpeta padre como la actual
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewFolderName(""); // Limpiar el input
            fetchContents(); // Refrescar la lista de subcarpetas
            alert("✅ Subcarpeta creada correctamente.");
        } catch (error) {
            console.error("❌ Error al crear subcarpeta:", error);
            alert("❌ Error al crear la subcarpeta.");
        }
    };

    return (
        <div className="folder-contents" style={{ backgroundColor: "#fff", minHeight: "100vh", padding: "20px" }}>
            <h2>📁 Contenido de la Carpeta</h2>

            {/* 📌 Input para crear una nueva subcarpeta */}
            <div className="create-subfolder">
                <input
                    type="text"
                    placeholder="Nombre de la subcarpeta"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                />
                <button onClick={createSubfolder}>Crear Subcarpeta</button>
            </div>

            {loading ? <p>Cargando...</p> : (
                <>
                    <h3>📂 Subcarpetas</h3>
                    <ul>
                        {subfolders.length === 0 ? <p>No hay subcarpetas.</p> :
                            subfolders.map(folder => (
                                <li key={folder.id}>
                                    <Link to={`/folder/${folder.id}`}>{folder.name}</Link>
                                </li>
                            ))
                        }
                    </ul>

                    <h3>📄 Documentos</h3>
                    <ul>
                        {documents.length === 0 ? <p>No hay documentos.</p> :
                            documents.map(doc => (
                                <li key={doc.id}>
                                    <button onClick={() => downloadFile(doc.id, doc.name)}>
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
