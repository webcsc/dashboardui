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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/**
 * French month abbreviations for display
 * Maps English month names to French 3-letter abbreviations
 */
export const FRENCH_MONTHS: Record<string, string> = {
    "January": "Jan",
    "February": "Fév",
    "March": "Mar",
    "April": "Avr",
    "May": "Mai",
    "June": "Juin",
    "July": "Juil",
    "August": "Août",
    "September": "Sep",
    "October": "Oct",
    "November": "Nov",
    "December": "Déc"
};

/**
 * Universe type mappings for Equipment
 * Maps API universe names to display keys
 */
export const EQUIPEMENT_UNIVERSE_MAPPING: Record<string, string> = {
    "MACHINES": "vente",
    "LOCATION MACHINES": "location",
    "Assistance Premium": "assistance",
    "PACK ENTRETIEN": "entretien"
};

/**
 * Minimum weight threshold (in kg) to display as kg instead of g
 */
export const KG_THRESHOLD = 1;

/**
 * Grams per kilogram conversion factor
 */
export const GRAMS_PER_KG = 1000;
