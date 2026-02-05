/**
 * Constantes globales de l'application CSC Dashboard
 * @module constants
 */

/**
 * Présets de périodes disponibles pour les filtres
 */
export const FILTER_PRESETS = [
    { label: 'Ce mois', value: 'current-month' },
    { label: 'Mois dernier', value: 'last-month' },
    { label: 'Ce trimestre', value: 'current-quarter' },
    { label: 'Trimestre dernier', value: 'last-quarter' },
    { label: 'Cette année', value: 'current-year' },
    { label: 'Année dernière', value: 'last-year' },
    { label: 'Personnalisé', value: 'custom' },
] as const;

/**
 * Régions disponibles pour les filtres
 */
export const REGIONS = [
    { label: 'Île-de-France', value: 'idf' },
    { label: 'Auvergne-Rhône-Alpes', value: 'ara' },
    { label: 'PACA', value: 'paca' },
    { label: 'Occitanie', value: 'occitanie' },
    { label: 'Nouvelle-Aquitaine', value: 'na' },
    { label: 'Grand Est', value: 'ge' },
] as const;

/**
 * Types de clients disponibles pour les filtres
 */
export const CLIENT_TYPES = [
    { label: 'Entreprises', value: 'entreprise' },
    { label: 'Administrations', value: 'admin' },
    { label: 'Coworking', value: 'coworking' },
    { label: 'Particuliers', value: 'particulier' },
] as const;

/**
 * Configuration de temps de cache pour React Query (en millisecondes)
 */
export const CACHE_TIME = {
    /** Temps avant que les données soient considérées comme obsolètes */
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    /** Temps de rétention en cache */
    CACHE_TIME: 10 * 60 * 1000, // 10 minutes
} as const;

/**
 * Configuration pour l'accessibilité
 */
export const A11Y_CONFIG = {
    /** Délai avant annonce des changements dynamiques (ms) */
    LIVE_REGION_DELAY: 100,
    /** Temps de timeout pour les messages toast (ms) */
    TOAST_DURATION: 5000,
} as const;

