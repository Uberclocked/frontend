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

interface ComponentFieldForm {
  name: string;
  type: FieldType;
  required: boolean;
  defaultValue: string;
}

export default function CreateComponentDialog({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { getAccessTokenSilently } = useAuth0();

  const [skuPrefix, setSkuPrefix] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [fields, setFields] = useState<ComponentFieldForm[]>([]);

  const addField = () => {
    setFields([
      ...fields,
      { name: "", type: "STRING", required: false, defaultValue: "" },
    ]);
  };

  const updateField = (index: number, updated: Partial<ComponentFieldForm>) => {
    const copy = [...fields];
    copy[index] = { ...copy[index], ...updated };
    setFields(copy);
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
      skuPrefix,
      displayName,
      fields: mappedFields,
    };

    try {
      const token = await getAccessTokenSilently();

      await fetchWithAuth(
        "http://localhost:8080/components",
        token,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      setSkuPrefix("");
      setDisplayName("");
      setFields([]);

      onCreated();
    } catch (e) {
      console.error("Error creating component", e);
      alert("Error creating component");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-white">
          New Component
        </Button>
      </DialogTrigger>

      <DialogContent className="border max-w-3xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Create Component
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <label className="block text-sm mb-1">SKU Prefix</label>
            <Input
              value={skuPrefix}
              onChange={(e) => setSkuPrefix(e.target.value)}
              placeholder="CPU, GPU, RAM..."
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Display name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Processor, Graphics Card..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Fields</span>
              <Button                             className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-8"

                                                  onClick={addField}
              >
                Add field
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-3 items-center p-3 rounded-lg"
              >
                <Input
                  placeholder="Name"
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

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={field.required}
                    onCheckedChange={(v) =>
                      updateField(index, { required: Boolean(v) })
                    }
                  />
                  <span className="text-sm">Required</span>
                </div>

                <Input
                  placeholder="Default"
                  value={field.defaultValue}
                  onChange={(e) =>
                    updateField(index, { defaultValue: e.target.value })
                  }
                />

                <Button
                  variant="destructive"
                  onClick={() => removeField(index)}
                >
                  X
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            className=" w-full font-semiboldbg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
          >
            Create component
          </Button>
        </div>
      </DialogContent>
    </Dialog >
  );
}
