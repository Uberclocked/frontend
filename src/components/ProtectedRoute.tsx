import { useAuth0 } from "@auth0/auth0-react";
import type {ReactNode} from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
    const { isAuthenticated, isLoading } = useAuth0();

    if (isLoading) return <p>Loading auth...</p>;

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}