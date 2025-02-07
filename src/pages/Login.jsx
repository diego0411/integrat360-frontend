import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

function Login() {
    const { setUser } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });

            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
                setUser(res.data.user);
                window.location.href = "/";
            } else {
                console.error("No se recibió un token en la respuesta del servidor.");
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Iniciar Sesión</button>
        </div>
    );
}

export default Login;
