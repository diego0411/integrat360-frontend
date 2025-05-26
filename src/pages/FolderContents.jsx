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

    const loadFolderData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [contentRes, foldersRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/folders/${folderId}/contents`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/folders`, { headers })
            ]);

            setSubfolders(contentRes.data.subfolders || []);
            setDocuments(contentRes.data.documents || []);

            const folders = foldersRes.data?.ownFolders
                ? [...foldersRes.data.ownFolders, ...(foldersRes.data.sharedFolders || [])]
                : foldersRes.data;

            const mainFolders = folders.filter(folder => !folder.parent_id && folder.id !== folderId);
            setAllFolders(mainFolders);
        } catch (error) {
            console.error("❌ Error al cargar contenido de la carpeta:", error);
        } finally {
            setLoading(false);
        }
    };

    const createSubfolder = async () => {
        if (!newFolderName.trim()) return alert("⚠️ Ingresa un nombre para la subcarpeta.");

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${import.meta.env.VITE_API_URL}/folders`, {
                name: newFolderName,
                parent_id: folderId
            }, { headers });

            setNewFolderName("");
            loadFolderData();
        } catch (error) {
            console.error("❌ Error al crear subcarpeta:", error);
        }
    };

    const moveSubfolder = async (subfolderId, newParentId) => {
        if (!subfolderId || !newParentId) return alert("⚠️ Selecciona una carpeta de destino válida.");
        if (subfolderId === newParentId) return alert("⛔ No puedes mover una carpeta dentro de sí misma.");

        try {
            setMoving(true);
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            await axios.put(`${import.meta.env.VITE_API_URL}/folders/move`, {
                folder_id: subfolderId,
                new_parent_id: newParentId
            }, { headers });

            alert("✅ Carpeta movida correctamente.");
            loadFolderData();
        } catch (error) {
            console.error("❌ Error al mover la carpeta:", error);
            alert("❌ Error al mover la carpeta.");
        } finally {
            setMoving(false);
        }
    };

    const uploadFile = async (event, targetFolderId) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", targetFolderId);

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            };
            await axios.post(`${import.meta.env.VITE_API_URL}/documents`, formData, { headers });
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
                                            <Button variant="outlined" onClick={() => window.open(doc.url, "_blank")}> <FaDownload /> Descargar </Button>
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
