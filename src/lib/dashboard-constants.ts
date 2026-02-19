/**
 * Dashboard Constants
 *
 * Centralized constants used across dashboard components and utilities
 */

/**
 * Default number of months to display in evolution charts
 */
export const DEFAULT_EVOLUTION_MONTHS = 12;

/**
 * Month names in chronological order (English)
 * Used for sorting and transforming evolution data
 */
export const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * French month abbreviations for display
 * Maps English month names to French 3-letter abbreviations
 */
export const FRENCH_MONTHS: Record<string, string> = {
  January: "Jan",
  February: "Fév",
  March: "Mar",
  April: "Avr",
  May: "Mai",
  June: "Juin",
  July: "Juil",
  August: "Août",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Déc",
};

/**
 * Universe type mappings for Equipment
 * Maps API universe names to display keys
 */
export const EQUIPEMENT_UNIVERSE_MAPPING: Record<string, string> = {
  MACHINES: "vente",
  "LOCATION MACHINES": "location",
  "Assistance Premium": "assistance",
  "PACK ENTRETIEN": "entretien",
};

/**
 * Universe type mappings for Consommable
 */
export const CONSOMMABLE_UNIVERSE_MAPPING: Record<string, string> = {
  Thé: "the",
  Divers: "divers",
};

/**
 * Color mapping for Consommable categories
 */
export const CONSOMMABLE_CATEGORY_COLORS: Record<string, string> = {
  Thé: "hsl(164, 45%, 41%)",
  Sucre: "hsl(39, 75%, 51%)",
  Chocolat: "hsl(19, 62%, 46%)",
  Gobelets: "hsl(202, 53%, 51%)",
  Agitateurs: "hsl(273, 67%, 58%)",
  Autres: "hsl(218, 17%, 62%)",
  "Moins de 5%": "hsl(0, 0%, 65%)",
  "Moins de 2%": "hsl(0, 0%, 65%)",
  default: "hsl(0, 0%, 75%)",
};

/**
 * Global color mapping for other universes to ensure consistency
 */
export const GLOBAL_CATEGORY_COLORS: Record<string, string> = {
  ...CONSOMMABLE_CATEGORY_COLORS,
  Réparation: "hsl(280, 45%, 45%)",
  Installation: "hsl(280, 40%, 55%)",
  "Changement cartouche": "hsl(280, 35%, 65%)",
  "Prêt machine": "hsl(280, 30%, 72%)",
  "Échange standard": "hsl(280, 25%, 80%)",
  "1kg": "hsl(25, 60%, 35%)",
  "250g": "hsl(25, 45%, 50%)",
  Capsules: "hsl(25, 35%, 65%)",
};

/**
 * Minimum weight threshold (in kg) to display as kg instead of g
 */
export const KG_THRESHOLD = 1;

/**
 * Grams per kilogram conversion factor
 */
export const GRAMS_PER_KG = 1000;
