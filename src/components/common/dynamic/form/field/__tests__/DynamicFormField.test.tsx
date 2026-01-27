import { screen, userEvent } from "@storybook/test";
import { render } from "@testing-library/react";
import { it, vi, expect, describe } from "vitest";

import DynamicFormField from "../DynamicFormField";

describe("DynamicFormField", async () => {
  it("forwards user interactions correctly", async () => {
    const onChange = vi.fn();
    const onDelete = vi.fn();

    render(
      <DynamicFormField
        field={{
          id: "1",
          body: {
            name: "",
            type: "",
            default_value: "",
            is_required: false,
          },
        }}
        types={[{ name: "string" }]}
        onChange={onChange}
        onDelete={onDelete}
      />,
    );

    await userEvent.type(screen.getByLabelText("Name"), "A");
    expect(onChange).toHaveBeenLastCalledWith("1", { name: "A" });

    await userEvent.type(screen.getByLabelText("Default Value"), "A");
    expect(onChange).toHaveBeenLastCalledWith("1", { default_value: "A" });

    await userEvent.click(screen.getByLabelText("Is required"));
    expect(onChange).toHaveBeenLastCalledWith("1", { is_required: true });

    await userEvent.click(screen.getByLabelText("Remove field"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
