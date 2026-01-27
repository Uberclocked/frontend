import { Input } from "./input";

export type InputFieldProps = {
  id: string;
  label: string;
  value: string;
  isRequired: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputField(props: InputFieldProps & { isRequired?: boolean }) {
  return (
    <div className="relative w-full">
      <Input
        id={props.id}
        value={props.value}
        onChange={props.onChange}
        placeholder=" "
        aria-label={props.label}
        className="
          peer
          h-auto
          pt-6 pb-2
          placeholder:text-transparent
          focus-visible:ring-0
        "
        required={props.isRequired}
      />

      <label
        htmlFor={props.id}
        className="
          pointer-events-none
          absolute left-3 top-2
          text-sm text-muted-foreground
          transition-all
          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:-translate-y-1/2
          peer-placeholder-shown:text-base
          peer-focus:top-2
          peer-focus:text-sm
          peer-focus:text-foreground
        "
      >
        {props.label}
        {props.isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
}

export default InputField;
