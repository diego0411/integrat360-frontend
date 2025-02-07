import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setUser(res.data);
            console.log("Usuario autenticado:", res.data);
        })
        .catch(() => {
            console.error("Token inválido o expirado");
            localStorage.removeItem("token");
            setUser(null);
        })
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Cargando...</p>;

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
