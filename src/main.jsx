import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";  // 🔥 IMPORTANTE

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>  {/* 🔥 Aquí debe envolver toda la App */}
            <App />
        </AuthProvider>
    </React.StrictMode>
);
