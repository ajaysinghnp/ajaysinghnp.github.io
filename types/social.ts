import type { ReactNode } from "react";

export interface Social {
  icon?: ReactNode;
  href: string;
  label: string;
  handle?: string;
}
