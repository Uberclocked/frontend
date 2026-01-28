import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import EditComponentDialog from "@/components/EditComponentDialog.tsx";
import { Button } from "@/components/ui/button.tsx";

import CreateComponentDialog from "../../components/CreateComponentDialog.tsx";
import { fetchWithAuth } from "../../services/api.ts";

type FieldType = "STRING" | "INTEGER" | "DECIMAL" | "BOOLEAN" | "DATE";

interface ComponentDto {
    skuPrefix: string;
    displayName: string;
    fields: Record<
        string,
        {
            type: FieldType;
            required: boolean;
            defaultValue: string | null;
        }
    >;
}
export default function Components() {
    const { getAccessTokenSilently } = useAuth0();

    const [components, setComponents] = useState<ComponentDto[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadComponents() {
        try {
            const token = await getAccessTokenSilently();

            const data = await fetchWithAuth<ComponentDto[]>(
                "http://localhost:8080/components",
                token
            );

            setComponents(data);
        } catch (e) {
            console.error("Error loading components", e);
            alert("Error loading components");
        } finally {
            setLoading(false);
        }
    }

    async function deleteComponent(code: string) {
        const ok = confirm(`Delete component '${code}'?`);
        if (!ok) return;

        try {
            const token = await getAccessTokenSilently();

            await fetchWithAuth<void>(
                `http://localhost:8080/components/${code}`,
                token,
                { method: "DELETE" }
            );

            loadComponents();
        } catch (e) {
            console.error("Error deleting component", e);
            alert("Error deleting component");
        }
    }

    useEffect(() => {
        loadComponents();
    }, []);

    return (
        <div className="p-4 md:p-6 min-h-screen bg-[#2b3740]">
            <div className="flex justify-between items-center mb-4 max-w-5xl mx-auto">
                <h1 className="text-[#F5F5DC] text-xl font-bold">
                    Components
                </h1>

                <CreateComponentDialog onCreated={loadComponents} />
            </div>

            <div className="max-w-5xl mx-auto bg-[#36454F] rounded-lg p-2 text-[#F5F5DC] shadow-xl border border-gray-700">
                {loading ? (
                    <p className="text-gray-400 p-4 text-xs animate-pulse">Loading...</p>
                ) : components.length === 0 ? (
                    <p className="text-gray-400 text-xs p-4 text-center">
                        No components loaded yet.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                            <tr className="hover:bg-[#2b3740] transition-colors">
                                <th className="py-1.5 px-3 text-center font-semibold uppercase tracking-wider text-sm text-gray-300">
                                    SKU
                                </th>
                                <th className="py-1.5 px-3 text-center font-semibold uppercase tracking-wider text-sm text-gray-300">
                                    Name
                                </th>
                                <th className="py-1.5 px-3 text-center font-semibold uppercase tracking-wider text-sm text-gray-300">
                                    Fields
                                </th>
                                <th className="py-1.5 px-3 text-center font-semibold uppercase tracking-wider text-sm text-gray-300">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                            {components.map((c) => (
                                <tr
                                    key={c.skuPrefix}
                                    className="hover:bg-[#2b3740] transition-colors"
                                >
                                    <td className="py-1 px-3 text-center font-mono text-sm text-[#F5F5DC]">
                                        {c.skuPrefix}
                                    </td>
                                    <td className="py-1 px-3 text-center text-sm font-medium text-[#F5F5DC]">
                                        {c.displayName}
                                    </td>
                                    <td className="py-1 px-3">
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {Object.keys(c.fields)
                                                .slice(0, 3)
                                                .map((field) => (
                                                    <span
                                                        key={field}
                                                        className="
                        bg-gray-800
                        border border-gray-600
                        rounded-full
                        px-2
                        py-px
                        text-xs
                        text-gray-200
                        whitespace-nowrap
                    "
                                                    >
                    {field}
                </span>
                                                ))}

                                            {Object.keys(c.fields).length > 3 && (
                                                <span className="text-xs text-gray-400 self-center">
                +{Object.keys(c.fields).length - 3}
            </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-1.5 px-3">
                                        <div className="flex justify-center items-center gap-2">
                                            <EditComponentDialog
                                                component={c}
                                                onUpdated={loadComponents}
                                            />
                                            <Button
                                                variant="ghost"
                                                className="
                                                    h-7
                                                    px-1
                                                    text-[18px]
                                                    font-bold
                                                    bg-transparent
                                                    text-red-500
                                                    hover:text-red-400
                                                    hover:bg-transparent
                                                "
                                                onClick={() => deleteComponent(c.skuPrefix)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}