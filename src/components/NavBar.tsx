import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
    const {
        loginWithRedirect,
        logout,
        isAuthenticated,
        isLoading
    } = useAuth0();

    const navigate = useNavigate();

    if (isLoading) return null;

    return (
        <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
            {!isAuthenticated && (
                <>
                    <button
                        onClick={() =>
                            loginWithRedirect({
                                authorizationParams: {
                                    redirect_uri: window.location.origin + "/auth-callback"
                                }
                            })
                        }
                    >
                        Login / Sign up
                    </button>

                    <button onClick={() => (window.location.href = "/?guest=true")}>
                        Login as Guest
                    </button>
                </>
            )}

            {isAuthenticated && (
                <>
                    <button
                        onClick={() =>
                            logout({
                                logoutParams: { returnTo: window.location.origin }
                            })
                        }
                    >
                        Log out
                    </button>

                    <button onClick={() => navigate("/profile")}>
                        Go to Profile
                    </button>
                </>
            )}
        </nav>
    );
}