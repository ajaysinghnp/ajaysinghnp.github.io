import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function yearsSince(
  startDate: Date,
  endDate: Date = new Date()
): number {
  let years = endDate.getFullYear() - startDate.getFullYear();

  const hasNotReachedAnniversary =
    endDate.getMonth() < startDate.getMonth() ||
    (endDate.getMonth() === startDate.getMonth() &&
      endDate.getDate() < startDate.getDate());

  if (hasNotReachedAnniversary) {
    years--;
  }

  return years;
}
