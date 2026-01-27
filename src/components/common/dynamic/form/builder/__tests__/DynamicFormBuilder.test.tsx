import { userEvent } from "@storybook/test";
import { render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { InputFieldProps } from "@/components/ui/InputField";

import DynamicFormBuilder from "../DynamicFormBuilder";
import useDynamicFormBuilder from "../DynamicFormBuilder.hooks";

vi.mock("../DynamicFormBuilder.hooks", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/api/apiClient", () => ({
  default: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn(),
  },
}));

describe("DynamicFormBuilder", () => {
  const formTitle = "Test Form";
  const formButtonText = "Test Form Button";

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDynamicFormBuilder).mockReturnValue({
      fields: [],
      addField: vi.fn(),
      updateField: vi.fn(),
      removeField: vi.fn(),
      submit: vi.fn(),
    });
  });

  it("Renders base component", async () => {
    render(
      <DynamicFormBuilder
        title={formTitle}
        fixedFields={[]}
        buttonText={formButtonText}
        onRequest={vi.fn()}
      />,
    );

    expect(await screen.findByText(formTitle)).toBeInTheDocument();
    expect(screen.getByText(formButtonText)).toBeInTheDocument();
  });

  it("Renders fixed fields", async () => {
    const fixedFields: InputFieldProps[] = [
      {
        id: "email",
        label: "Email",
        value: "",
        isRequired: false,
        onChange: vi.fn(),
      },
    ];

    render(
      <DynamicFormBuilder
        title={formTitle}
        fixedFields={fixedFields}
        buttonText={formButtonText}
        onRequest={vi.fn()}
      />,
    );

    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
  });

  it("Does not render dynamic fields when no fields are added", async () => {
    render(
      <DynamicFormBuilder
        title={formTitle}
        buttonText={formButtonText}
        fixedFields={[]}
        onRequest={vi.fn()}
      />,
    );

    await screen.findByText(formTitle);
    expect(screen.queryByLabelText("Dynamic Fields")).not.toBeInTheDocument();
  });

  it("Renders dynamic fields when fields exist", async () => {
    vi.mocked(useDynamicFormBuilder).mockReturnValue({
      fields: [
        {
          id: "1",
          body: {
            name: "",
            type: "",
            default_value: "",
            is_required: false,
          },
        },
      ],
      addField: vi.fn(),
      updateField: vi.fn(),
      removeField: vi.fn(),
      submit: vi.fn(),
    });

    render(
      <DynamicFormBuilder
        title={formTitle}
        buttonText={formButtonText}
        fixedFields={[]}
        onRequest={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("group", { name: "Dynamic Field 1" }),
    ).toBeInTheDocument();
  });

  it("Shows success toast on submit success", async () => {
    const submit = vi.fn().mockResolvedValue("Success!");

    vi.mocked(useDynamicFormBuilder).mockReturnValue({
      fields: [],
      addField: vi.fn(),
      updateField: vi.fn(),
      removeField: vi.fn(),
      submit,
    });

    render(
      <DynamicFormBuilder
        title={formTitle}
        buttonText={formButtonText}
        fixedFields={[]}
        onRequest={vi.fn()}
      />,
    );

    await screen.findByText(formButtonText);
    await userEvent.click(screen.getByText(formButtonText));

    expect(toast.promise).toHaveBeenCalledTimes(1);
  });

  it("Shows error toast on submit failure", async () => {
    const submit = vi.fn().mockRejectedValue(new Error("Boom!"));

    vi.mocked(useDynamicFormBuilder).mockReturnValue({
      fields: [],
      addField: vi.fn(),
      updateField: vi.fn(),
      removeField: vi.fn(),
      submit,
    });

    render(
      <DynamicFormBuilder
        title={formTitle}
        buttonText={formButtonText}
        fixedFields={[]}
        onRequest={vi.fn()}
      />,
    );

    await screen.findByText(formButtonText);
    await userEvent.click(screen.getByText(formButtonText));

    expect(toast.promise).toHaveBeenCalledTimes(1);
  });
});
