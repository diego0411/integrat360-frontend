import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { TreeView, TreeItem } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { FaUpload, FaFolder, FaDownload, FaTrash } from "react-icons/fa";

function FolderContents() {
  const { folderId } = useParams();
  const [subfolders, setSubfolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allFolders, setAllFolders] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [deletingFolderId, setDeletingFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolderToMove, setSelectedFolderToMove] = useState(null);
  const [folderToMove, setFolderToMove] = useState(null);
  const [openMoveDialog, setOpenMoveDialog] = useState(false);

  useEffect(() => {
    loadFolderData();
  }, [folderId]);

  const loadFolderData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [contentRes, foldersRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/folders/${folderId}/contents`,
          { headers }
        ),
        axios.get(`${import.meta.env.VITE_API_URL}/folders`, { headers }),
      ]);

      setSubfolders(contentRes.data.subfolders || []);
      setDocuments(contentRes.data.documents || []);

      const all = foldersRes.data?.ownFolders
        ? [
            ...foldersRes.data.ownFolders,
            ...(foldersRes.data.sharedFolders || []),
          ]
        : foldersRes.data;

      setAllFolders(all);
    } catch (error) {
      console.error("❌ Error al cargar contenido de la carpeta:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (folders, parentId = null) => {
    return folders
      .filter((folder) => folder.parent_id === parentId)
      .map((folder) => (
        <TreeItem
          key={folder.id}
          nodeId={folder.id}
          label={<span style={{ fontSize: 14 }}>{folder.name}</span>}
          onClick={() => setSelectedFolderToMove(folder.id)}
        >
          {buildTree(folders, folder.id)}
        </TreeItem>
      ));
  };

  const createSubfolder = async () => {
    if (!newFolderName.trim())
      return alert("⚠️ Ingresa un nombre para la subcarpeta.");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/folders`,
        {
          name: newFolderName,
          parent_id: folderId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewFolderName("");
      loadFolderData();
    } catch (error) {
      console.error("❌ Error al crear subcarpeta:", error);
    }
  };

  const moveSubfolder = async () => {
    if (!folderToMove || !selectedFolderToMove)
      return alert("⚠️ Carpeta de destino inválida.");
    if (folderToMove === selectedFolderToMove)
      return alert("⛔ No puedes mover una carpeta dentro de sí misma.");

    try {
      setMoving(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/folders/move`,
        {
          folder_id: folderToMove,
          new_parent_id: selectedFolderToMove,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Carpeta movida correctamente.");
      setFolderToMove(null);
      setSelectedFolderToMove(null);
      setOpenMoveDialog(false);
      loadFolderData();
    } catch (error) {
      console.error("❌ Error al mover la carpeta:", error);
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

      await axios.post(`${import.meta.env.VITE_API_URL}/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      loadFolderData();
    } catch (error) {
      console.error("❌ Error al subir el archivo:", error);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm("⚠️ ¿Deseas eliminar este documento?")) return;

    try {
      setDeletingDocId(docId);
      const token = localStorage.getItem("token");

      await axios.delete(`${import.meta.env.VITE_API_URL}/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      loadFolderData();
    } catch (error) {
      console.error("❌ Error al eliminar documento:", error);
    } finally {
      setDeletingDocId(null);
    }
  };

  const deleteSubfolder = async (subfolderId) => {
    if (!window.confirm("⚠️ ¿Deseas eliminar esta subcarpeta y su contenido?"))
      return;

    try {
      setDeletingFolderId(subfolderId);
      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/folders/${subfolderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      loadFolderData();
    } catch (error) {
      console.error("❌ Error al eliminar subcarpeta:", error);
    } finally {
      setDeletingFolderId(null);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        maxWidth: "900px",
        margin: "auto",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="h5" gutterBottom>
        📁 Contenido de la Carpeta
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          label="Nombre de subcarpeta"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
        <Button variant="contained" onClick={createSubfolder}>
          Crear
        </Button>
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
                  <TableCell>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subfolders.map((folder) => (
                  <TableRow key={folder.id}>
                    <TableCell>
                      <Link
                        to={`/folder/${folder.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <FaFolder /> {folder.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <label htmlFor={`upload-${folder.id}`}>
                        <Button component="span" size="small">
                          <FaUpload /> Subir
                        </Button>
                      </label>
                      <input
                        type="file"
                        id={`upload-${folder.id}`}
                        style={{ display: "none" }}
                        onChange={(e) => uploadFile(e, folder.id)}
                        disabled={uploading}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setFolderToMove(folder.id);
                          setOpenMoveDialog(true);
                        }}
                      >
                        Seleccionar destino
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteSubfolder(folder.id)}
                        disabled={deletingFolderId === folder.id}
                      >
                        <FaTrash /> Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" sx={{ mt: 4 }}>
            📄 Documentos
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descargar</TableCell>
                  <TableCell>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.original_name}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = doc.url;
                          link.download = doc.original_name || "documento.pdf";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <FaDownload /> Descargar
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => deleteDocument(doc.id)}
                        disabled={deletingDocId === doc.id}
                      >
                        <FaTrash /> Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog
            open={openMoveDialog}
            onClose={() => setOpenMoveDialog(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Mover carpeta a...</DialogTitle>
            <DialogContent dividers>
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                sx={{ maxHeight: 300, overflowY: "auto" }}
              >
                {buildTree(allFolders.filter((f) => f.id !== folderToMove))}
              </TreeView>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenMoveDialog(false)}>Cancelar</Button>
              <Button
                onClick={moveSubfolder}
                disabled={moving || !selectedFolderToMove}
                variant="contained"
              >
                Mover aquí
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

export default FolderContents;
