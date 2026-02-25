import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FALLBACK_IMAGE } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

/** Returns imageUrl if it's a valid absolute URL/path, otherwise returns the fallback placeholder. */
export function getImageUrl(imageUrl: string | null | undefined, fallback = FALLBACK_IMAGE): string {
  if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
    return imageUrl;
  }
  return fallback;
}
