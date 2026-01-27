import { describe, it, expect } from "vitest";

import type { FieldModel } from "server/src/components/fields/fields.type";

import type { FieldWrapper } from "../DynamicFormBuilder.types";
import { generateMessage, generatePayload } from "../DynamicFormBuilder.utils";

describe("DynamicFormBuilder.utils", () => {
  describe("generateMessage", () => {
    it("Returns correct message if no fields are passed", () => {
      expect(generateMessage([])).toEqual("With no extra fields");
    });
    it("Correctly generates message if a list of fields is passed", () => {
      const withNoDefaultUnrequiredField: FieldModel = {
        name: "Test Field",
        type: "Type",
        default_value: "",
        is_required: false,
      };
      const withNoDefaultUnrequiredExpectedMessage =
        'With the following fields:\n• Field "Test Field", which is optional, of type Type with no default.';
      expect(generateMessage([withNoDefaultUnrequiredField])).toEqual(
        withNoDefaultUnrequiredExpectedMessage,
      );
      const withDefaultRequiredField: FieldModel = {
        name: "Test Field",
        type: "Type",
        default_value: "Default",
        is_required: true,
      };
      const withDefaultExpectedMessage =
        'With the following fields:\n• Field "Test Field", which is required, of type Type with "Default" as default.';
      expect(generateMessage([withDefaultRequiredField])).toEqual(
        withDefaultExpectedMessage,
      );
    });
  });
  describe("generatePayload", () => {
    it("Returns empty list if empty list is passed", () => {
      expect(generatePayload([])).toEqual([]);
    });
    it("Returns expected list to a list of fields", () => {
      const fieldBody: FieldModel = {
        name: "Test Field",
        type: "Type",
        default_value: "",
        is_required: false,
      };
      const field: FieldWrapper = {
        id: "0",
        body: fieldBody,
      };
      expect(generatePayload([field])).toEqual([fieldBody]);
    });
  });
});
