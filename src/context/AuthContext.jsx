import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // ⏳ Para evitar redirecciones mientras se carga

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
            }).catch(err => {
                console.warn("⚠️ Token inválido o expirado:", err.response?.data || err.message);
                logout();
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // 📌 Función para iniciar sesión
    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
    };

    // 📌 Función para cerrar sesión
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
