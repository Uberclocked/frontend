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
    <div className="p-4 md:p-6 min-h-screen">
      <div className="flex justify-between items-center mb-4 max-w-5xl mx-auto">
        <h1 className="text-xl font-bold">
          Components
        </h1>

        <CreateComponentDialog onCreated={loadComponents} />
      </div>

      <div className="max-w-5xl mx-auto rounded-lg p-2 shadow-xl border">
        {loading ? (
          <p className="p-4 text-xs animate-pulse">Loading...</p>
        ) : components.length === 0 ? (
          <p className="text-xs p-4 text-center">
            No components loaded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="transition-colors">
                  <th className="py-1.5 px-3 text-center font-semibold uppercase tracking-wider text-sm">
                    SKU
                  </th>
                  <th className="py-1.5 px-3 text-center font-semibold uppercase tracking-wider text-sm">
                    Name
                  </th>
                  <th className="py-1.5 px-3 text-center font-semibold uppercase tracking-wider text-sm">
                    Fields
                  </th>
                  <th className="py-1.5 px-3 text-center font-semibold uppercase tracking-wider text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {components.map((c) => (
                  <tr
                    key={c.skuPrefix}
                    className="transition-colors"
                  >
                    <td className="py-1 px-3 text-center font-mono text-sm">
                      {c.skuPrefix}
                    </td>
                    <td className="py-1 px-3 text-center text-sm font-medium">
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
                        border
                        rounded-full
                        px-2
                        py-px
                        text-xs
                        whitespace-nowrap
                    "
                            >
                              {field}
                            </span>
                          ))}

                        {Object.keys(c.fields).length > 3 && (
                          <span className="text-xs self-center">
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
                            className="
                              h-7
                              px-3
                              bg-gray-200
                              hover:bg-gray-300
                              text-gray-800
                              font-semibold
                              rounded-md
                              transition
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
