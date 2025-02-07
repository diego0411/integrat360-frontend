import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    // 📌 Función para cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem("token");  // 🔐 Eliminar token de autenticación
        navigate("/login");  // 🔄 Redirigir al login
    };

    return (
        <nav className="navbar">
            {/* 📌 Título Solaria */}
            <div className="navbar-brand">
                <Link to="/">
                <img src="/solaria logo.png" alt="Solaria" className="logo" />
                </Link>  <span className="brand-text">Solaria</span>
            </div>

            <Link to="/">🏠 Inicio</Link>
            <Link to="/documents">📄 Documentos</Link>
            <Link to="/folders">📂 Carpetas</Link>
            <Link to="/manage-users">👥 Usuarios</Link>
            <Link to="/chat">💬 Chat</Link>
            <Link to="/manageevents">👥 Events</Link>
            <Link to="/managegroups">👥 Grupos</Link> {/* ✅ Nueva opción para grupos */}
            <button onClick={handleLogout} className="logout-btn">🚪 Cerrar sesión</button>
        </nav>
    );
}

export default Navbar;
