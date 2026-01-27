import { useState } from "react";

import DynamicFormBuilder from "@/components/common/dynamic/form/builder/DynamicFormBuilder";
import type { FormRequestResult } from "@/components/common/dynamic/form/builder/DynamicFormBuilder.types";
import { generateMessage } from "@/components/common/dynamic/form/builder/DynamicFormBuilder.utils";
import { isApiError } from "@/lib/api/api.types";
import apiClient from "@/lib/api/apiClient";
import type { ComponentModel } from "server/src/components/components.types";
import type { FieldModel } from "server/src/components/fields/fields.type";

function ComponentBuilder() {
  const [skuPrefix, setSkuPrefix] = useState("");
  const [displayName, setDisplayName] = useState("");
  const fixedFields = [
    {
      id: "sku_prefix",
      label: "SKU Prefix",
      value: skuPrefix,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setSkuPrefix(e.target.value);
      },
      isRequired: true,
    },
    {
      id: "display_name",
      label: "Display Name",
      value: displayName,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayName(e.target.value);
      },
      isRequired: true,
    },
  ];

  return (
    <DynamicFormBuilder
      title="Create New Component"
      fixedFields={fixedFields}
      buttonText="Create"
      onRequest={async (fields: FieldModel[]): Promise<FormRequestResult> => {
        for (const fixedField of fixedFields) {
          if (fixedField.isRequired && !fixedField.value.toString().trim()) {
            throw new Error("Please fill in all required fields");
          }
        }
        try {
          const payload = {
            sku_prefix: skuPrefix,
            display_name: displayName,
            fields,
          };
          const data = await apiClient.post<ComponentModel, ComponentModel>(
            "/components",
            payload,
          );
          console.log(data);
          return {
            title: `Successfully created component "${data.display_name}" with SKU prefix "${data.sku_prefix}".`,
            description: generateMessage(data.fields),
          };
        } catch (err) {
          console.error("Error:", err);
          if (isApiError(err)) {
            const message = err.message;
            throw new Error(`An error occurred: ${message}`);
          }
          throw new Error("Unknown error");
        }
      }}
    />
  );
}

export default ComponentBuilder;
