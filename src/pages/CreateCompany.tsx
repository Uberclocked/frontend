import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import CompanyForm from "../components/CompanyForm";

export default function CreateCompanyPage() {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            getAccessTokenSilently()
                .then((t) => setToken(t))
                .catch((err) => console.error("Error getting token", err));
        }
    }, [getAccessTokenSilently, isAuthenticated]);

    const handleSuccess = () => {
        console.log("Company successfully created!");
    };

    if (!token) {
        return <p>Loading authentication...</p>;
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Register Company</h1>
            <CompanyForm
                token={token}
                onSuccess={handleSuccess}
            />
        </div>
    );
}