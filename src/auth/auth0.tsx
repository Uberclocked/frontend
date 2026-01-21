import { Auth0Provider } from "@auth0/auth0-react";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
    return (
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN as string}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID as string}
            authorizationParams={{
                redirect_uri: window.location.origin + "/auth-callback",
                audience: import.meta.env.VITE_AUTH0_AUDIENCE as string
            }}
        >
            {children}
        </Auth0Provider>
    );
};