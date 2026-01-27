import { useState } from "react";

import type { FieldModel } from "server/src/components/fields/fields.type";

import type {
  FieldWrapper,
  FormRequestResult,
} from "./DynamicFormBuilder.types";
import { generatePayload } from "./DynamicFormBuilder.utils";

function useDynamicFormBuilder(
  onRequest: (fields: FieldModel[]) => Promise<FormRequestResult>,
) {
  const [fields, setFields] = useState<FieldWrapper[]>([]);
  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        body: {
          name: "",
          type: "",
          default_value: "",
          is_required: false,
        },
      },
    ]);
  };

  const updateField = (id: string, partial: Partial<FieldModel>) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id
          ? {
              ...field,
              body: {
                ...field.body,
                ...partial,
              },
            }
          : field,
      ),
    );
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id != id));
  };

  const submit = async () => {
    const REQUIRED_KEYS: (keyof FieldModel)[] = ["name", "type"];
    for (const field of fields) {
      for (const key of REQUIRED_KEYS) {
        const value = field.body[key];
        if (!String(value).trim()) {
          throw new Error("Please fill in all required fields");
        }
      }
    }
    return onRequest(generatePayload(fields));
  };

  return {
    fields,
    addField,
    updateField,
    removeField,
    submit,
  };
}

export default useDynamicFormBuilder;
