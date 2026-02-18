import { useState } from "react";
import { fetchWithAuth } from "../services/api";
import type { CompanyDataDto } from "../types/CompanyDataDto";

interface Props {
    token: string;
    loading?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CompanyForm({
                                        token,
                                        onSuccess,
                                        onCancel,
                                    }: Props) {
    const [form, setForm] = useState<CompanyDataDto>({
        name: "",
        cuit: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleNumericChange = (field: "cuit" | "phone", value: string) => {
        const onlyNumbers = value.replace(/\D/g, "");
        setForm((prev) => ({ ...prev, [field]: onlyNumbers }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            await fetchWithAuth("http://localhost:8080/companies", token, {
                method: "POST",
                body: JSON.stringify(form),
            });

            if (onSuccess) onSuccess();

            setForm({
                name: "",
                cuit: "",
                email: "",
                phone: "",
            });
        } catch (err: any) {
            setError(err?.message || "Failed to create company");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md rounded-xl shadow-lg p-6 bg-white">
            <h1 className="text-2xl font-semibold mb-6 text-center">
                Register Company
            </h1>

            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm mb-1">Company Name</label>
                    <input
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
                        placeholder="Company Name"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">CUIT</label>
                    <input
                        value={form.cuit}
                        onChange={(e) => handleNumericChange("cuit", e.target.value)}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
                        placeholder="CUIT"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                        type="email"
                        value={form.email ?? ""}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
                        placeholder="Email"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Phone</label>
                    <input
                        value={form.phone ?? ""}
                        onChange={(e) => handleNumericChange("phone", e.target.value)}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
                        placeholder="Phone"
                    />
                </div>

                {error && (
                    <span className="text-sm text-red-600">{error}</span>
                )}
            </div>

            <div className="flex justify-end items-center mt-8">
                <div className="flex gap-4">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded border"
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2 rounded font-semibold bg-primary text-white disabled:opacity-60"
                    >
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}