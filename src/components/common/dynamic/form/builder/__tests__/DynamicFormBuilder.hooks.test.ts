import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { FieldModel } from "server/src/components/fields/fields.type";

import useDynamicFormBuilder from "../DynamicFormBuilder.hooks";
import { generateMessage } from "../DynamicFormBuilder.utils";

describe("useDynamicFormBuilder", () => {
  const onRequest = async (fields: FieldModel[]) => {
    return generateMessage(fields);
  };
  it("Adds a new field", () => {
    const { result } = renderHook(() => useDynamicFormBuilder(onRequest));
    act(() => {
      result.current.addField();
    });
    expect(result.current.fields).toHaveLength(1);
  });
  it("Updates a field", () => {
    const { result } = renderHook(() => useDynamicFormBuilder(onRequest));
    act(() => {
      result.current.addField();
      result.current.addField();
    });
    const fieldId: string = result.current.fields[0].id;

    const newFieldBody: FieldModel = {
      name: "Field Name",
      type: "Type",
      default_value: "Default Value",
      is_required: true,
    };
    act(() => {
      result.current.updateField(fieldId, newFieldBody);
    });
    const actualFieldBody = result.current.fields[0].body;
    expect(actualFieldBody).toEqual(newFieldBody);
  });
  it("Removes a field", () => {
    const { result } = renderHook(() => useDynamicFormBuilder(onRequest));
    act(() => {
      result.current.addField();
    });
    const fieldId: string = result.current.fields[0].id;

    act(() => {
      result.current.removeField(fieldId);
    });

    expect(result.current.fields).toHaveLength(0);
  });
  it("Submits the form with no extra fields", async () => {
    const { result } = renderHook(() => useDynamicFormBuilder(onRequest));

    const submitResult = await result.current.submit();

    expect(submitResult).toEqual("With no extra fields");
  });
  it("Submits the form fails with empty fields", async () => {
    const { result } = renderHook(() => useDynamicFormBuilder(onRequest));

    await act(async () => {
      result.current.addField();
    });

    await expect(result.current.submit()).rejects.toThrow(
      "Please fill in all required fields",
    );
  });
  it("Submits form succesfully when required fields are filled", async () => {
    const { result } = renderHook(() => useDynamicFormBuilder(onRequest));

    act(() => {
      result.current.addField();
    });

    const fieldId: string = result.current.fields[0].id;
    const newFieldBody: FieldModel = {
      name: "New Field",
      type: "Type",
      default_value: "",
      is_required: false,
    };

    act(() => {
      result.current.updateField(fieldId, newFieldBody);
    });

    const expected: string = `With the following fields:\n• Field "New Field", which is optional, of type Type with no default.`;
    const actual: string = await result.current.submit();

    expect(actual).toEqual(expected);
  });
});
