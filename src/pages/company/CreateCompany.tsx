import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyForm from "../../components/CompanyForm";

export default function CreateCompanyPage() {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [token, setToken] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            getAccessTokenSilently()
                .then((t) => setToken(t))
                .catch((err) => console.error("Error getting token", err));
        }
    }, [getAccessTokenSilently, isAuthenticated]);

    if (!isAuthenticated) return <p>You must login</p>;
    if (!token) return <p>Loading...</p>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <CompanyForm
                token={token}
                onSuccess={() => navigate("/")}
                onCancel={() => navigate("/")}
            />
        </div>
    );
}