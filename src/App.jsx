import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Chat from "./components/Chat";
import ManageUsers from "./pages/ManageUsers";
import Folders from "./pages/Folders";
import Login from "./pages/Login";
import ManageGroups from "./pages/ManageGroups";
import ManageEvents from "./pages/ManageEvents";
import "./styles/estilos-optimizados.css";

function AppContent() {
    const location = useLocation();
    const { user } = useContext(AuthContext); // ✅ Obtiene el usuario autenticado
    const hideSidebar = location.pathname === "/login";

    return (
        <div className="app-container">
            {!hideSidebar && user && <Sidebar />}

            <div className={!hideSidebar ? "main-content" : ""}>
                <Routes>
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/managegroups" element={user ? <ManageGroups /> : <Navigate to="/login" />} />
                    <Route path="/manageevents" element={user ? <ManageEvents /> : <Navigate to="/login" />} />
                    <Route path="/documents" element={user ? <Documents /> : <Navigate to="/login" />} />
                    <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
                    <Route path="/manage-users" element={user ? <ManageUsers /> : <Navigate to="/login" />} />
                    <Route path="/folders" element={user ? <Folders /> : <Navigate to="/login" />} />
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
