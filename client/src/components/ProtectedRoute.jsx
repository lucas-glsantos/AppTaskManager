import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext"
import LoadingScreen from "@/components/loader/LoadingScreen";

// Rota Privada: Logado -> "/", "/create", "/task/:id"
export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <LoadingScreen textContent="Carregando sessão..." />
        );
    }

    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    return children;
};


// Rota Pública: Deslogado -> "/login"
export function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <LoadingScreen textContent="Carregando..." />
        );
    }

    if (user) return <Navigate to="/" replace />;

    return children;
};

export default ProtectedRoute;