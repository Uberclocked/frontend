import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import DynamicFormField from "@/components/common/dynamic/form/field/DynamicFormField";
import { Button } from "@/components/ui/button";
import InputField, { type InputFieldProps } from "@/components/ui/InputField";
import { Separator } from "@/components/ui/separator";
import SuccesComponent from "@/components/ui/toast/SuccesComponent";
import apiClient from "@/lib/api/apiClient";
import { notify } from "@/lib/utils";
import type { TypeModel } from "server/src/components/fields/types/types.types";

import useDynamicFormBuilder from "./DynamicFormBuilder.hooks";
import type {
  DynamicFormBuilderProps,
  FormRequestResult,
} from "./DynamicFormBuilder.types";

function DynamicFormBuilder({
  fixedFields = [],
  title,
  buttonText,
  onRequest,
}: DynamicFormBuilderProps) {
  const { fields, addField, updateField, removeField, submit } =
    useDynamicFormBuilder(onRequest);
  const [types, setTypes] = useState([] as TypeModel[]);

  useEffect(() => {
    apiClient.get<TypeModel[]>("/components/fields/types").then(setTypes);
  }, []);

  const handleSubmit = async () => {
    notify.promise<FormRequestResult>(
      /* istanbul ignore next */ () => submit(),
      {
        /* istanbul ignore next */
        loading: "Processing request...",
        /* istanbul ignore next */
        success: (result) => SuccesComponent(result),
        /* istanbul ignore next */
        error: (err) => (err instanceof Error ? err.message : "Unknown error"),
      },
    );
  };
  return (
    <div className="flex flex-col w-full h-full min-h-0 gap-4">
      <div className="flex flex-col justify-center items-center">
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <Separator />
      <div className="flex gap-4 p-8 w-full">
        {fixedFields.map((field: InputFieldProps) => (
          <InputField key={field.id} {...field} onChange={field.onChange} />
        ))}
      </div>
      <Separator />
      <div className="flex flex-col flex-1 justify-evenly items-center w-full min-h-0">
        {fields.length > 0 && (
          <div
            className="flex flex-col gap-6 p-8 w-full overflow-auto flex-[1] min-h-0"
            aria-label="Dynamic Fields"
          >
            {fields.map((field, index) => (
              <fieldset
                key={field.id}
                aria-label={`Dynamic Field ${index + 1}`}
                className="border-0 p-0 m-0"
              >
                <DynamicFormField
                  field={field}
                  types={types}
                  onDelete={removeField}
                  onChange={updateField}
                />
                <Separator className="mt-6" />
              </fieldset>
            ))}
          </div>
        )}
        <div className="flex justify-center p-4 shrink-0">
          <Button onClick={addField} size="icon" aria-label="Add New Field">
            <Plus />
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col justify-center items-center">
        <Button size="lg" onClick={handleSubmit}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export default DynamicFormBuilder;
