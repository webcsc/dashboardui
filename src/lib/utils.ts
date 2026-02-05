import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire pour fusionner des classes Tailwind
 * 
 * Combine `clsx` pour la logique conditionnelle et `tailwind-merge` 
 * pour résoudre les conflits de classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

