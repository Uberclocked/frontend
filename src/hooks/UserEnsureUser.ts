import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export function useEnsureUser() {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        if (!isAuthenticated) return;

        async function ensureUserExists() {
            const token = await getAccessTokenSilently();

            await fetch("http://localhost:8080/me", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        ensureUserExists();
    }, [isAuthenticated, getAccessTokenSilently]);
}
