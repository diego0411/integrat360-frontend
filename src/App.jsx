import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Chat from "./components/Chat";
import ManageUsers from "./pages/ManageUsers";
import Folders from "./pages/Folders";
import Login from "./pages/Login"; 
import ManageGroups from "./pages/ManageGroups";
import ManageEvents from "./pages/ManageEvents"


// 📌 Componente principal con lógica para ocultar el Navbar en /login
function AppContent() {
    const location = useLocation();  // 📌 Obtiene la ruta actual

    return (
        <div className="app-container">
            {/* ✅ Muestra el Navbar solo si NO estamos en /login */}
            {location.pathname !== "/login" && <Navbar />}

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
