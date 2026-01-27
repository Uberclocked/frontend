import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const notify = {
  success: toast.success,
  info: toast.info,
  warning: toast.warning,
  error: toast.error,
  promise: toast.promise,
};
