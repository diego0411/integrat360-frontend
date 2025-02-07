import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Login() {
    const { setUser } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "https://integrat360intranet-production.up.railway.app"; // Asegurar HTTPS

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, 
                { email, password }, 
                { withCredentials: true } // Permitir cookies de autenticación
            );

            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
                setUser && setUser(res.data.user); // Evitar error si setUser no está definido
                window.location.href = "/";
            } else {
                setError("No se recibió un token en la respuesta del servidor.");
            }
        } catch (error) {
            console.error("❌ Error al iniciar sesión:", error);
            setError(error.response?.data?.error || "Error al conectar con el servidor.");
        }
    };

    return (
        <div>
            <h1>Login</h1>
            {error && <p style={{ color: "red" }}>{error}</p>} {/* Mostrar errores */}
            <input 
                type="email" 
                placeholder="Email" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
            />
            <input 
                type="password" 
                placeholder="Contraseña" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
            />
            <button onClick={handleLogin}>Iniciar Sesión</button>
        </div>
    );
}

export default Login;
