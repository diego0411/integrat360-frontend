import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal,
  IconButton,
  CircularProgress,
  Divider
} from "@mui/material";
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

  const fetchProjectFolders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/folders/projects`);
      setProjectFolders(data.projectFolders || []);
    } catch (error) {
      console.error("❌ Error al obtener carpetas de proyectos:", error);
      setProjectFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    const trimmedName = newProjectName.trim();
    if (!trimmedName) {
      return alert("⚠️ Ingresa un nombre válido para el proyecto.");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return alert("⚠️ No se encontró un token de autenticación.");
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/folders/projects`,
        { name: trimmedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Proyecto "${trimmedName}" creado con sus subcarpetas.`);
      setNewProjectName("");
      setOpenModal(false);
      fetchProjectFolders();
    } catch (error) {
      console.error("❌ Error al crear el proyecto:", error.response?.data || error.message);
      alert("❌ No se pudo crear el proyecto.");
    }
  };

  const handleFileUpload = async () => {
    if (!file || !selectedFolder) {
      return alert("⚠️ Selecciona un archivo y una carpeta antes de subir.");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return alert("⚠️ No estás autenticado.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_id", selectedFolder);

    try {
      setUploading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
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
    <Box className="folders-container">
      <Typography variant="h5" className="title">📁 Gestión de Carpetas de Proyectos</Typography>

      <Button
        className="btn-primary"
        startIcon={<FaPlus />}
        onClick={() => setOpenModal(true)}
      >
        Crear Proyecto
      </Button>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box className="modal-box">
          <Typography variant="h6">Crear Nuevo Proyecto</Typography>
          <TextField
            fullWidth
            size="small"
            label="Nombre del Proyecto"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="input-field"
            autoFocus
          />
          <Button className="btn-primary" fullWidth onClick={createProject}>
            Crear Proyecto
          </Button>
        </Box>
      </Modal>

      {loading ? (
        <CircularProgress className="loading-spinner" />
      ) : projectFolders.length === 0 ? (
        <Typography>No hay carpetas de proyectos disponibles.</Typography>
      ) : (
        <List className="folder-list">
          {projectFolders.map(folder => (
            <ListItem
              key={folder.id}
              className="folder-item"
              button
              onClick={() => navigate(`/folder/${folder.id}`)}
            >
              <ListItemIcon>
                <FaFolder className="folder-icon" />
              </ListItemIcon>
              <ListItemText primary={folder.name} className="folder-name" />
              <IconButton
                aria-label="Subir archivo"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFolder(folder.id);
                }}
              >
                <FaUpload className="upload-icon" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}

      <Divider className="divider" />

      {selectedFolder && (
        <Box className="upload-section">
          <Typography variant="h6">📤 Subir Archivo</Typography>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <Button
            className="btn-secondary"
            onClick={handleFileUpload}
            disabled={uploading}
          >
            {uploading ? "Subiendo..." : "Subir"}
          </Button>
          <Button className="btn-cancel" onClick={() => setSelectedFolder(null)}>
            Cancelar
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default FoldersProyectos;
