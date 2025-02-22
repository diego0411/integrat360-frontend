import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, List, ListItem, ListItemIcon, ListItemText, Modal, IconButton, CircularProgress, Divider } from "@mui/material";
import { FaFolder, FaUpload, FaPlus } from "react-icons/fa";

function FoldersProyectos() {
    const navigate = useNavigate();
    const [projectFolders, setProjectFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");

    useEffect(() => {
        fetchProjectFolders();
    }, []);

    // 📌 Obtener carpetas del área "proyectos"
    const fetchProjectFolders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders/projects`);
            if (res.status === 200) {
                setProjectFolders(res.data.projectFolders || []);
            } else {
                console.warn("⚠️ Respuesta inesperada al obtener carpetas de proyectos:", res);
            }
        } catch (error) {
            console.error("❌ Error al obtener carpetas de proyectos:", error);
            setProjectFolders([]);
        } finally {
            setLoading(false);
        }
    };

    // 📂 Crear un nuevo proyecto con sus subcarpetas
    const createProject = async () => {
        if (!newProjectName.trim()) {
            alert("⚠️ Ingresa un nombre válido para el proyecto.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("⚠️ No se encontró un token de autenticación.");
                return;
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/folders/projects`, {
                name: newProjectName
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert(`✅ Proyecto "${newProjectName}" creado con sus subcarpetas.`);
            setNewProjectName("");
            setOpenModal(false);
            fetchProjectFolders(); // Recargar la lista de carpetas

        } catch (error) {
            console.error("❌ Error al crear el proyecto:", error);
            alert("❌ No se pudo crear el proyecto.");
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
            await axios.post(`${import.meta.env.VITE_API_URL}/documents`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });

            alert("✅ Archivo subido correctamente.");
            setFile(null);
            setSelectedFolder(null);
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error.response?.data || error.message);
            alert("❌ Error al subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh", maxWidth: "800px", margin: "auto", borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h5" gutterBottom>📁 Gestión de Carpetas de Proyectos</Typography>

            {/* Botón para crear proyecto */}
            <Button 
                variant="contained" 
                color="primary" 
                startIcon={<FaPlus />} 
                onClick={() => setOpenModal(true)} 
                sx={{ mb: 3 }}
            >
                Crear Proyecto
            </Button>

            {/* 📌 Modal para ingresar el nombre del proyecto */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, width: "90%", maxWidth: "400px", margin: "auto", mt: "10%", textAlign: "center", boxShadow: 3 }}>
                    <Typography variant="h6">Crear Nuevo Proyecto</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nombre del Proyecto"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        sx={{ my: 2 }}
                    />
                    <Button variant="contained" color="primary" fullWidth onClick={createProject}>
                        Crear Proyecto
                    </Button>
                </Box>
            </Modal>

            {/* 📂 Lista de Carpetas de Proyectos */}
            {loading ? (
                <CircularProgress />
            ) : projectFolders.length === 0 ? (
                <Typography>No hay carpetas de proyectos disponibles.</Typography>
            ) : (
                <List className="folder-list">
                    {projectFolders.map(folder => (
                        <ListItem key={folder.id} className="folder-item" button onClick={() => navigate(`/folder/${folder.id}`)}>
                            <ListItemIcon>
                                <FaFolder className="folder-icon" />
                            </ListItemIcon>
                            <ListItemText primary={folder.name} className="folder-name" />
                            <IconButton onClick={(e) => { e.stopPropagation(); setSelectedFolder(folder.id); }}>
                                <FaUpload className="upload-icon" />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            )}

            <Divider sx={{ my: 3 }} />

            {/* 📤 Sección de Subida de Archivos */}
            {selectedFolder && (
                <Box className="upload-section">
                    <Typography variant="h6">📤 Subir Archivo</Typography>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <Button variant="contained" color="secondary" onClick={handleFileUpload} disabled={uploading} sx={{ ml: 2 }}>
                        {uploading ? "Subiendo..." : "Subir"}
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => setSelectedFolder(null)} sx={{ ml: 2 }}>
                        Cancelar
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default FoldersProyectos;
