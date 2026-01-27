import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import { Toaster } from "sonner";

import ComponentBuilder from "./ComponentBuilder";

const meta: Meta<typeof ComponentBuilder> = {
  title: "UI/ComponentBuilder",
  component: ComponentBuilder,
  tags: ["test"],
  decorators: [
    (Story) => (
      <div className="w-[800px] h-[96vh] p-0 m-0 border">
        <Toaster richColors position="top-right" />
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    //Test SKU Prefix input
    const newPrefix = "Test Prefix";
    const prefixInput = canvas.getByLabelText("SKU Prefix", {
      selector: "input",
    });
    await userEvent.type(prefixInput, newPrefix);
    await expect(prefixInput).toHaveValue(newPrefix);

    //Test SKU Prefix input
    const newName = "Test name";
    const nameInput = canvas.getByLabelText("Display Name", {
      selector: "input",
    });
    await userEvent.type(nameInput, newName);
    await expect(nameInput).toHaveValue(newName);

    //Test adding new fields
    const addFieldButton = canvas.getByRole("button", {
      name: "Add New Field",
    });
    await userEvent.click(addFieldButton);

    //Test loading data for new field
    const groups = canvas.getAllByRole("group");
    await expect(groups.length).toBe(1);
    const field = within(groups.at(-1)!);
    const newFieldName = "New Field";
    const newFieldDefaultValue = "Default Value";
    const fieldNameInput = field.getByRole("textbox", { name: "Name" });
    const fieldTypeSelector = field.getByRole("combobox", { name: "Type" });
    const fieldDefaultInput = field.getByRole("textbox", {
      name: "Default Value",
    });
    const isRequiredCheckbox = field.getByRole("checkbox", {
      name: "Is required",
    });
    await userEvent.type(fieldNameInput, newFieldName);
    await userEvent.click(fieldTypeSelector);
    const options = await within(document.body).findAllByRole("option");
    await userEvent.click(options[0]);
    await userEvent.type(fieldDefaultInput, newFieldDefaultValue);
    await userEvent.click(isRequiredCheckbox);
    await expect(fieldNameInput).toHaveValue(newFieldName);
    await expect(fieldDefaultInput).toHaveValue(newFieldDefaultValue);
    await expect(isRequiredCheckbox).toBeChecked();

    //Test removing a new field
    await userEvent.click(addFieldButton);
    const newGroups = canvas.getAllByRole("group");
    await expect(newGroups.length).toBe(2);
    const newField = within(newGroups.at(-1)!);
    const removeFieldButton = newField.getByRole("button", {
      name: "Remove field",
    });
    await userEvent.click(removeFieldButton);
    await expect(canvas.getAllByRole("group").length).toBe(1);
  },
  args: {},
};
