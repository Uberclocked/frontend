import { useState } from "react";

import { fetchWithAuth } from "../services/api";
import type { CompanyDataDto } from "../types/CompanyDataDto";

interface Props {
    token: string;
    onSuccess?: () => void;
}

export default function CompanyForm({ token, onSuccess }: Props) {
    const [form, setForm] = useState<CompanyDataDto>({
        name: "",
        cuit: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await fetchWithAuth(
                "http://localhost:8080/companies",
                token,
                {
                    method: "POST",
                    body: JSON.stringify(form)
                }
            );

            alert("Company created successfully!");
            if (onSuccess) onSuccess();

            setForm({
                name: "",
                cuit: "",
                email: "",
                phone: "",
            });

        } catch (err: any) {
            setError(err.message || "Failed to create company");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                maxWidth: 400
            }}
        >
            <input
                type="text"
                name="name"
                placeholder="Company Name"
                value={form.name}
                onChange={handleChange}
                required
            />

            <input
                type="text"
                name="cuit"
                placeholder="CUIT"
                value={form.cuit}
                onChange={handleChange}
                required
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email || ""}
                onChange={handleChange}
            />

            <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={form.phone || ""}
                onChange={handleChange}
            />

            {error && (
                <span style={{ color: "red" }}>
                    {error}
                </span>
            )}

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Company"}
            </button>
        </form>
    );
}