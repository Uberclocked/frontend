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
                <Button className="bg-[#FF8000] text-white hover:bg-[#e67300]">
                    New Component
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-[#36454F] border  border-gray-600 text-[#F5F5DC] max-w-3xl rounded-xl">
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
                            className="bg-[#2b3740] text-[#F5F5DC] border-gray-600 focus:ring-[#F5F5DC]"
                            placeholder="CPU, GPU, RAM..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Display name</label>
                        <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="bg-[#2b3740] text-[#F5F5DC] border-gray-600 focus:ring-[#F5F5DC]"
                            placeholder="Processor, Graphics Card..."
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Fields</span>
                            <Button
                                onClick={addField}
                                className="
                                    bg-[#2b3740]
                                    text-[#F5F5DC]
                                    border border-gray-600
                                    hover:bg-[#1f2a31]
                                "
                            >
                                Add field
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-5 gap-3 items-center bg-[#2b3740] p-3 rounded-lg"
                            >
                                <Input
                                    placeholder="Name"
                                    value={field.name}
                                    onChange={(e) =>
                                        updateField(index, { name: e.target.value })
                                    }
                                    className="bg-[#1f2a31] text-[#F5F5DC] border-gray-600"
                                />

                                <Select
                                    value={field.type}
                                    onValueChange={(v) =>
                                        updateField(index, { type: v as FieldType })
                                    }
                                >
                                    <SelectTrigger className="bg-[#1f2a31] text-[#F5F5DC] border-gray-600">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                    className="bg-[#1f2a31] text-[#F5F5DC] border-gray-600"
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
                        className="w-full bg-[#FF8000] text-[#F5F5DC] font-semibold hover:bg-[#e67300]"
                    >
                        Create component
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
