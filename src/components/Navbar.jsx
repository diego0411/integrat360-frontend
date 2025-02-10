import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src="/solaria-logo.png" alt="Solaria" className="logo" />
                <span className="brand-text">Solaria</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">🚪 Cerrar sesión</button>
        </nav>
    );
}

export default Navbar;
