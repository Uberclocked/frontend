import { FieldModel } from "./fields/fields.type";

export type ComponentModel = {
  sku_prefix: string;
  display_name: string;
  fields: FieldModel[];
};
