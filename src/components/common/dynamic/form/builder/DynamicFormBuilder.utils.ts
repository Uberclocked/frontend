import type { FieldModel } from "server/src/components/fields/fields.type";

import type { FieldWrapper } from "./DynamicFormBuilder.types";

export const generatePayload = (fields: FieldWrapper[]) =>
  fields.map((field: FieldWrapper) => field.body);

export const generateMessage = (fields: FieldModel[]) =>
  fields.length === 0
    ? "With no extra fields"
    : `With the following fields:${reduceFieldsToMessage(fields)}`;

const reduceFieldsToMessage = (field_bodies: FieldModel[]) =>
  field_bodies.reduce(
    (str, field_body) =>
      `${str}\n${destructureFieldBodyIntoString(field_body)}`,
    "",
  );

const destructureFieldBodyIntoString = (field: FieldModel) =>
  `• Field "${field.name}", ` +
  `which is ${field.is_required ? "required" : "optional"}, ` +
  `of type ${field.type} ` +
  `${field.default_value.trim() ? `with "${field.default_value}" as default` : "with no default"}.`;
