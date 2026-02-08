
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a normalized unique key for a company based on name and city.
 * Used for duplicate lead detection.
 */
export function generateCompanyKey(companyName: string, city: string) {
  if (!companyName || !city) return "";
  const normalizedName = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedCity = city.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${normalizedName}${normalizedCity}`;
}
