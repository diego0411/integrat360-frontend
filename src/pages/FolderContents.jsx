import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { 
    Box, Typography, Button, TextField, Select, MenuItem, CircularProgress, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from "@mui/material";
import { FaUpload, FaFolder, FaDownload } from "react-icons/fa";

function FolderContents() {
    const { folderId } = useParams();
    const [subfolders, setSubfolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allFolders, setAllFolders] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [moving, setMoving] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    useEffect(() => {
        loadFolderData();
    }, [folderId]);

    // 📌 Cargar carpetas y documentos
    const loadFolderData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const [contentRes, foldersRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/folders/${folderId}/contents`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${import.meta.env.VITE_API_URL}/folders`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setSubfolders(contentRes.data.subfolders || []);
            setDocuments(contentRes.data.documents || []);

            let foldersArray = [];
            if (Array.isArray(foldersRes.data)) {
                foldersArray = foldersRes.data;
            } else if (foldersRes.data?.ownFolders) {
                foldersArray = [...foldersRes.data.ownFolders, ...(foldersRes.data.sharedFolders || [])];
            }

            // 🔍 Obtener solo carpetas principales y excluir la actual
            const mainFolders = foldersArray.filter(folder => !folder.parent_id && folder.id !== folderId);
            setAllFolders(mainFolders);

        } catch (error) {
            console.error("❌ Error al cargar contenido de la carpeta:", error);
        } finally {
            setLoading(false);
        }
    };

    // 📂 Crear subcarpeta
    const createSubfolder = async () => {
        if (!newFolderName.trim()) return alert("⚠️ Ingresa un nombre para la subcarpeta.");

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/folders`, {
                name: newFolderName,
                parent_id: folderId
            }, { headers: { Authorization: `Bearer ${token}` } });

            setNewFolderName("");
            loadFolderData();
        } catch (error) {
            console.error("❌ Error al crear subcarpeta:", error);
        }
    };

    // 📂 Mover subcarpeta
    const moveSubfolder = async (subfolderId, newParentId) => {
        if (!subfolderId || !newParentId) {
            alert("⚠️ Debes seleccionar una carpeta de destino válida.");
            return;
        }
    
        if (subfolderId === newParentId) {
            alert("⛔ No puedes mover una carpeta dentro de sí misma.");
            return;
        }
    
        try {
            setMoving(true);
            const token = localStorage.getItem("token");

            await axios.put(`${import.meta.env.VITE_API_URL}/folders/move`, {
                folder_id: subfolderId,
                new_parent_id: newParentId
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert("✅ Carpeta movida correctamente.");
            loadFolderData();
        } catch (error) {
            console.error("❌ Error al mover la carpeta:", error);
            alert("❌ Error al mover la carpeta.");
        } finally {
            setMoving(false);
        }
    };

    // 📤 Subir archivo
    const uploadFile = async (event, targetFolderId) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", targetFolderId);

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/documents`, formData, { headers: { Authorization: `Bearer ${token}` } });
            loadFolderData();
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh", maxWidth: "800px", margin: "auto", borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h5" gutterBottom>📁 Contenido de la Carpeta</Typography>

            {/* Crear Subcarpeta */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <TextField
                    size="small"
                    label="Nombre de subcarpeta"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                />
                <Button variant="contained" onClick={createSubfolder}>Crear</Button>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    {/* 📂 Subcarpetas */}
                    <Typography variant="h6">📂 Subcarpetas</Typography>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Subir Archivo</TableCell>
                                    <TableCell>Mover</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subfolders.map(folder => (
                                    <TableRow key={folder.id}>
                                        <TableCell>
                                            <Link to={`/folder/${folder.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                                <FaFolder className="folder-icon" /> {folder.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <input type="file" id={`upload-${folder.id}`} style={{ display: "none" }} onChange={(e) => uploadFile(e, folder.id)} disabled={uploading} />
                                            <label htmlFor={`upload-${folder.id}`}>
                                                <Button component="span" size="small"><FaUpload /> Subir</Button>
                                            </label>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                fullWidth
                                                value=""
                                                onChange={(e) => moveSubfolder(folder.id, e.target.value)}
                                                disabled={moving}
                                                size="small"
                                                displayEmpty
                                            >
                                                <MenuItem value="" disabled>Seleccionar carpeta...</MenuItem>
                                                {allFolders.map(parent => (
                                                    <MenuItem key={parent.id} value={parent.id}>{parent.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* 📄 Documentos */}
                    <Typography variant="h6" sx={{ mt: 4 }}>📄 Documentos</Typography>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Descargar</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {documents.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell>{doc.name}</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" onClick={() => window.open(doc.url, "_blank")}>
                                                <FaDownload /> Descargar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
}

export default FolderContents;
