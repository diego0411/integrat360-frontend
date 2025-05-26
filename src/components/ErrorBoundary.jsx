import React, { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("❌ Error capturado en ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h2>⚠️ Ocurrió un error en este componente. Recarga la página.</h2>;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
