import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "@/services/api";
import {useNavBarLogic} from "@/components/common/navbar/NavBar.hook.ts";

type Company = {
    id: string;
    name: string;
    cuit: string;
    phone?: string;
    email?: string;
};
export default function AdminCompaniesPage() {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const { isAdmin } = useNavBarLogic();
    const navigate = useNavigate();

    const [token, setToken] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            getAccessTokenSilently().then(setToken).catch(console.error);
        }
    }, [getAccessTokenSilently, isAuthenticated]);

    useEffect(() => {
        if (!token) return;

        setLoading(true);
        setError("");

        fetchWithAuth("http://localhost:8080/companies", token)
            .then((data) => setCompanies(data))
            .catch((e) => setError(e?.message || "Failed to load companies"))
            .finally(() => setLoading(false));
    }, [token]);

    if (!isAuthenticated) return <p>You must login</p>;
    if (!isAdmin) return <p>Admins only</p>;
    if (!token) return <p>Loading...</p>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="w-full max-w-4xl rounded-xl shadow-lg p-6 bg-white">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Companies</h1>
                    <div className="flex gap-3">
                        <button onClick={() => navigate("/create-company")} className="px-4 py-2 rounded font-semibold bg-primary text-white">
                            + Register Company
                        </button>
                        <button onClick={() => navigate("/")} className="px-4 py-2 rounded border">
                            Close
                        </button>
                    </div>
                </div>

                {loading && <p>Loading...</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}

                {!loading && !error && (
                    <div className="overflow-auto rounded border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/40">
                            <tr>
                                <th className="p-3 text-left">ID</th>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">CUIT</th>
                                <th className="p-3 text-left">Phone</th>
                            </tr>
                            </thead>

                            <tbody>
                            {companies.map((c) => (
                                <tr key={c.id} className="border-t hover:bg-muted/30 transition">
                                    <td className="p-3 font-mono text-xs break-all">{c.id}</td>
                                    <td className="p-3">{c.name}</td>
                                    <td className="p-3">{c.cuit}</td>
                                    <td className="p-3">{c.phone ?? "-"}</td>
                                </tr>
                            ))}

                            {companies.length === 0 && (
                                <tr>
                                    <td className="p-4 text-center text-muted-foreground" colSpan={4}>
                                        No companies found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
