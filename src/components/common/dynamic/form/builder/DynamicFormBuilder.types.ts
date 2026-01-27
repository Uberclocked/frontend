import type { InputFieldProps } from "@/components/ui/InputField";
import type { FieldModel } from "server/src/components/fields/fields.type";

export type DynamicFormBuilderProps = {
  title: string;
  fixedFields: InputFieldProps[];
  buttonText: string;
  onRequest: (fields: FieldModel[]) => Promise<FormRequestResult>;
};

export type FieldWrapper = {
  id: string;
  body: FieldModel;
};

export type FormRequestResult = {
  title: string;
  description: string;
};
