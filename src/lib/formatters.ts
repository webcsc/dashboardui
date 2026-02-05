/**
 * Fonctions de formatage pour les valeurs du dashboard
 * @module formatters
 */

/**
 * Formate une valeur monétaire en k€ ou M€
 * 
 * @param value - Valeur en euros
 * @returns Chaîne formatée (ex: "485k€" ou "1.2M€")
 * 
 * @example
 * ```typescript
 * formatCurrency(485000) // "485k€"
 * formatCurrency(1200000) // "1.2M€"
 * ```
 */
export const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M€`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k€`;
    }
    return `${value}€`;
};

/**
 * Formate un volume avec son unité
 * 
 * @param value - Valeur numérique
 * @param unit - Unité de mesure (défaut: "kg")
 * @returns Chaîne formatée avec séparateurs de milliers
 * 
 * @example
 * ```typescript
 * formatVolume(12500, 'kg') // "12 500 kg"
 * formatVolume(1200, 'unités') // "1 200 unités"
 * ```
 */
export const formatVolume = (value: number, unit: string = 'kg'): string => {
    return `${value.toLocaleString('fr-FR')} ${unit}`;
};

/**
 * Formate un pourcentage
 * 
 * @param value - Valeur de pourcentage
 * @param decimals - Nombre de décimales (défaut: 1)
 * @returns Chaîne formatée avec le symbole %
 * 
 * @example
 * ```typescript
 * formatPercentage(12.5) // "12.5%"
 * formatPercentage(66, 0) // "66%"
 * ```
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Formate un nombre avec séparateurs de milliers
 * 
 * @param value - Valeur numérique
 * @returns Chaîne formatée
 * 
 * @example
 * ```typescript
 * formatNumber(1234567) // "1 234 567"
 * ```
 */
export const formatNumber = (value: number): string => {
    return value.toLocaleString('fr-FR');
};

/**
 * Formate un prix unitaire
 * 
 * @param value - Prix en euros
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns Chaîne formatée
 * 
 * @example
 * ```typescript
 * formatPrice(38.80) // "38.80€"
 * ```
 */
export const formatPrice = (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}€`;
};

