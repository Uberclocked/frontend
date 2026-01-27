import { CircleMinus } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import InputField from "@/components/ui/InputField";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/SelectField";

import type { DynamicFormFieldProps } from "./DynamicFormField.types";

function DynamicFormField({
  field: { id, body },
  types,
  onDelete,
  onChange,
}: DynamicFormFieldProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(id, { name: e.target.value });

  const handleTypeChange = /* istanbul ignore next */ (value: string) =>
    onChange(id, { type: value });

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(id, { default_value: e.target.value });

  const toggleRequired = () => onChange(id, { is_required: !body.is_required });

  const handleDelete = () => onDelete(id);

  const typeOptions = useMemo(
    () =>
      types.map((type) => ({
        label: type.name,
        value: type.name,
      })),
    [types],
  );
  return (
    <div className="flex flex-row flex-[1] w-full justify-center items-center gap-5">
      <div className="flex flex-col flex-[2] items-center justify-center gap-5">
        <div className="flex flex-row flex-[2] min-w-min w-full justify-evenly items-center gap-5">
          <InputField
            id={`name-${id}`}
            label="Name"
            value={body.name}
            onChange={handleNameChange}
            isRequired={true}
          />
          <SelectField
            id={`type-${id}`}
            label={"Type"}
            value={body.type}
            options={typeOptions}
            onChange={handleTypeChange}
            isRequired
          />
          <InputField
            id={`default-${id}`}
            label="Default Value"
            value={body.default_value}
            onChange={handleDefaultChange}
            isRequired={false}
          />
        </div>
        <div className="flex flex-row flex-[1] gap-2 items-center justify-center">
          <Checkbox id={`${id}-isRequired`} onCheckedChange={toggleRequired} />
          <Label htmlFor={`${id}-isRequired`}>Is required</Label>
        </div>
      </div>
      <div className="flex flex-col flex-[1] justify-center items-center h-full">
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="icon"
          aria-label={`Remove field`}
        >
          <CircleMinus />
        </Button>
      </div>
    </div>
  );
}

export default DynamicFormField;
