import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Login() {
    const { login } = useContext(AuthContext); // ✅ Obtiene login() del contexto
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });

            if (res.data.token) {
                login(res.data.user, res.data.token); // ✅ Llama a login() correctamente
                window.location.href = "/";
            } else {
                console.error("No se recibió un token en la respuesta del servidor.");
            }
        } catch (error) {
            console.error("❌ Error al iniciar sesión:", error);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Iniciar Sesión</button>
        </div>
    );
}

export default Login;
