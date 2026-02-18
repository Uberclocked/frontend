import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchWithAuth } from "../services/api";

type FieldType = "STRING" | "INTEGER" | "DECIMAL" | "BOOLEAN" | "DATE";

interface FieldForm {
  name: string;
  type: FieldType;
  required: boolean;
  defaultValue: string;
}

export default function EditComponentDialog({
  component,
  onUpdated,
}: {
  component: {
    skuPrefix: string;
    displayName: string;
    fields: Record<
      string,
      { type: FieldType; required: boolean; defaultValue: string | null }
    >;
  };
  onUpdated: () => void;
}) {
  const { getAccessTokenSilently } = useAuth0();

  const [displayName, setDisplayName] = useState(component.displayName);
  const [fields, setFields] = useState<FieldForm[]>(
    Object.entries(component.fields).map(([name, f]) => ({
      name,
      type: f.type,
      required: f.required,
      defaultValue: f.defaultValue ?? "",
    }))
  );

  const updateField = (index: number, updated: Partial<FieldForm>) => {
    const copy = [...fields];
    copy[index] = { ...copy[index], ...updated };
    setFields(copy);
  };

  const addField = () => {
    setFields([
      ...fields,
      { name: "", type: "STRING", required: false, defaultValue: "" },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  async function handleSubmit() {
    const mappedFields: Record<string, any> = {};

    fields.forEach((f) => {
      if (!f.name) return;

      mappedFields[f.name] = {
        type: f.type,
        required: f.required,
        defaultValue: f.defaultValue || null,
      };
    });

    const body = {
      displayName,
      fields: mappedFields,
    };

    const token = await getAccessTokenSilently();

    await fetchWithAuth(
      `http://localhost:8080/components/${component.skuPrefix}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );

    onUpdated();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md font-semibold transition">
          Modify
        </button>
      </DialogTrigger>

      <DialogContent className="border max-w-3xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Modify component
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm">Display name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Fields</span>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                      onClick={addField}>
                Add
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-2 items-center p-2 rounded"
              >
                <Input
                  value={field.name}
                  onChange={(e) =>
                    updateField(index, { name: e.target.value })
                  }
                />

                <Select
                  value={field.type}
                  onValueChange={(v) =>
                    updateField(index, { type: v as FieldType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border bg-background text-foreground shadow-md backdrop-blur-none">
                    <SelectItem value="STRING">STRING</SelectItem>
                    <SelectItem value="INTEGER">INTEGER</SelectItem>
                    <SelectItem value="DECIMAL">DECIMAL</SelectItem>
                    <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                    <SelectItem value="DATE">DATE</SelectItem>
                  </SelectContent>
                </Select>

                <Checkbox
                  checked={field.required}
                  onCheckedChange={(v) =>
                    updateField(index, { required: Boolean(v) })
                  }
                />

                <Input
                  value={field.defaultValue}
                  onChange={(e) =>
                    updateField(index, {
                      defaultValue: e.target.value,
                    })
                  }
                />

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeField(index)}
                >
                  X
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit}  className=" w-full hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
