import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { fetchWithAuth } from "../services/api";

export default function AuthCallback() {
    const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) return;

        async function bootstrap() {
            const token = await getAccessTokenSilently();

            await fetchWithAuth(
                "http://localhost:8080/me",
                token,
                { method: "GET" }
            );

            navigate("/profile", { replace: true });
        }

        bootstrap();
    }, [isAuthenticated, isLoading, getAccessTokenSilently, navigate]);

    return <p>Preparing your account...</p>;
}
