import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Chat from "./components/Chat";
import ManageUsers from "./pages/ManageUsers";
import Folders from "./pages/Folders";
import FoldersProyectos from "./pages/FoldersProyectos";
import Login from "./pages/Login";
import ManageGroups from "./pages/ManageGroups";
import ManageEvents from "./pages/ManageEvents";
import FolderContents from "./pages/FolderContents";
import "./styles/estilos-optimizados.css";

function AppContent() {
    const location = useLocation();
    const { user } = useContext(AuthContext); // Ya no se usa para proteger rutas
    const hideSidebar = location.pathname === "/login";

    return (
        <div className="app-container">
            {!hideSidebar && <Sidebar />}

            <div className={!hideSidebar ? "main-content" : ""}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/folder/:folderId" element={<FolderContents />} />
                    <Route path="/managegroups" element={<ManageGroups />} />
                    <Route path="/manageevents" element={<ManageEvents />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/manage-users" element={<ManageUsers />} />
                    <Route path="/folders" element={<Folders />} />
                    <Route path="/folders/projects" element={<FoldersProyectos />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
