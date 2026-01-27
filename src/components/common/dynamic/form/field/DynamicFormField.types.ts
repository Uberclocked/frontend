import type { TypeModel } from "@/../server/src/components/fields/types/types.types";
import type { FieldModel } from "server/src/components/fields/fields.type";

import type { FieldWrapper } from "../builder/DynamicFormBuilder.types";

export type DynamicFormFieldProps = {
  field: FieldWrapper;
  types: TypeModel[];
  onDelete: (id: string) => void;
  onChange: (id: string, partial: Partial<FieldModel>) => void;
};
