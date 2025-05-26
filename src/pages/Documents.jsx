import { useEffect, useState } from "react";
import axios from "axios";
import {
    Box, Button, TextField, Select, MenuItem, Typography, List, ListItem,
    ListItemText, ListItemSecondaryAction, IconButton, Paper, Divider, Input
} from "@mui/material";
import { FaTrash, FaUpload } from "react-icons/fa";

function Documents() {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [folders, setFolders] = useState([]);
    const [folderId, setFolderId] = useState("");
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (folderId) fetchDocuments();
    }, [folderId]);

    const fetchFolders = async () => {
        try {
            setLoadingFolders(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { ownFolders = [], sharedFolders = [] } = res.data;
            setFolders([...ownFolders, ...sharedFolders]);
        } catch (error) {
            console.error("❌ Error al obtener carpetas:", error);
            alert("❌ No se pudieron obtener las carpetas.");
        } finally {
            setLoadingFolders(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/documents/${folderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(res.data || []);
        } catch (error) {
            console.error("❌ Error al obtener documentos:", error);
            alert("❌ Error al cargar los documentos.");
        }
    };

    const handleUpload = async () => {
        if (!folderId || !file) {
            alert("⚠️ Selecciona una carpeta y un archivo antes de subir.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder_id", folderId);

        try {
            setUploading(true);
            const token = localStorage.getItem("token");

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/documents`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("✅ Archivo subido correctamente.");
            setFile(null);
            fetchDocuments();
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error);
            alert("❌ No se pudo subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este documento?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/documents/${docId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDocuments();
        } catch (error) {
            console.error("❌ Error al eliminar el documento:", error);
            alert("❌ No se pudo eliminar el documento.");
        }
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
            <Typography variant="h5" gutterBottom>📂 Gestión de Documentos</Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1">Selecciona una Carpeta:</Typography>
                <Select
                    fullWidth
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    displayEmpty
                    sx={{ mt: 1 }}
                    disabled={loadingFolders}
                >
                    <MenuItem value="" disabled>Selecciona una carpeta</MenuItem>
                    {folders.map(folder => (
                        <MenuItem key={folder.id} value={folder.id}>
                            {folder.name}
                        </MenuItem>
                    ))}
                </Select>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1">Subir Archivo:</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                    <Input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        disabled={!folderId}
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<FaUpload />}
                        onClick={handleUpload}
                        disabled={!folderId || !file || uploading}
                    >
                        {uploading ? "Subiendo..." : "Subir"}
                    </Button>
                </Box>
            </Paper>

            <Typography variant="h6">📄 Documentos en la Carpeta</Typography>
            <Divider sx={{ my: 2 }} />

            {documents.length === 0 ? (
                <Typography variant="body2">⚠️ No hay documentos en esta carpeta.</Typography>
            ) : (
                <List>
                    {documents.map(doc => (
                        <ListItem key={doc.id} divider>
                            <ListItemText
                                primary={doc.original_name}
                                primaryTypographyProps={{ fontWeight: 500 }}
                                component="a"
                                href={`${import.meta.env.VITE_API_URL}/documents/download/${doc.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textDecoration: "none", color: "inherit" }}
                            />
                            <ListItemSecondaryAction>
                                <IconButton onClick={() => handleDelete(doc.id)}>
                                    <FaTrash />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
}

export default Documents;
