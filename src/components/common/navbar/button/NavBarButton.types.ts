import type { ReactNode } from "react";

export interface NavBarButtonProps {
  toUrl: string,
  text?: string,
  children?: ReactNode;
}
