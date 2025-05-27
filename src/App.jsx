import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import "./lib/axios-global"; // 👈 Esto modifica axios global


function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext);
    return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const hideSidebar = location.pathname === "/login";

    return (
        <div className="app-container">
            {!hideSidebar && <Sidebar />}
            <div className={!hideSidebar ? "main-content" : ""}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/folder/:folderId" element={<ProtectedRoute><FolderContents /></ProtectedRoute>} />
                    <Route path="/managegroups" element={<ProtectedRoute><ManageGroups /></ProtectedRoute>} />
                    <Route path="/manageevents" element={<ProtectedRoute><ManageEvents /></ProtectedRoute>} />
                    <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                    <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
                    <Route path="/folders" element={<ProtectedRoute><Folders /></ProtectedRoute>} />
                    <Route path="/folders/projects" element={<ProtectedRoute><FoldersProyectos /></ProtectedRoute>} />
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
