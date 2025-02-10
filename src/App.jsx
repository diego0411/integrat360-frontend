import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar"; // ✅ Importación corregida
import Sidebar from "./components/Sidebar"; // ✅ Importación corregida
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Chat from "./components/Chat"; // ✅ Verifica si el archivo existe y respeta mayúsculas/minúsculas
import ManageUsers from "./pages/ManageUsers";
import Folders from "./pages/Folders";
import Login from "./pages/Login";
import ManageGroups from "./pages/ManageGroups";
import ManageEvents from "./pages/ManageEvents";
import "./styles/estilos-optimizados.css";


// 📌 Componente principal con lógica para ocultar Navbar y Sidebar en /login
function AppContent() {
    const location = useLocation(); // 📌 Obtiene la ruta actual

    const hideNavbarAndSidebar = location.pathname === "/login";

    return (
        <div className="app-container">
            {/* ✅ Muestra Navbar y Sidebar solo si NO estamos en /login */}
            {!hideNavbarAndSidebar && (
                <>
                    <Navbar />
                    <Sidebar />
                </>
            )}

            <div className={!hideNavbarAndSidebar ? "main-content" : ""}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/managegroups" element={<ManageGroups />} />
                    <Route path="/manageevents" element={<ManageEvents />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/manage-users" element={<ManageUsers />} />
                    <Route path="/folders" element={<Folders />} />
                </Routes>
            </div>
        </div>
    );
}

// 📌 Envuelve `AppContent` en `Router`
function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
