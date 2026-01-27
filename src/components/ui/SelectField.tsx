import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectFieldOption = {
  value: string;
  label: string;
};

export type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  options: SelectFieldOption[];
  isRequired?: boolean;
  onChange: (value: string) => void;
};

export function SelectField({
  id,
  label,
  value,
  options,
  isRequired,
  onChange,
}: SelectFieldProps) {
  const hasValue = value !== undefined && value !== null && value.trim();

  return (
    <div className="relative w-full">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          aria-label={label}
          className="
            peer
            h-auto
            pt-6 pb-2
            focus-visible:ring-0
          "
        >
          <SelectValue placeholder=" " />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem
              id={option.value}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3 transition-all",

          // default = placeholder shown
          !hasValue &&
            "top-1/2 -translate-y-1/2 text-base text-muted-foreground",

          // open = focus
          "peer-data-[state=open]:top-0 peer-data-[state=open]:translate-y-0 peer-data-[state=open]:text-sm peer-data-[state=open]:text-foreground",

          // has value (like not placeholder-shown)
          hasValue && "top-2 translate-y-0 text-sm text-muted-foreground",
        )}
      >
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
}
