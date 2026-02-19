const KG_PER_TONNE = 1000;

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
export const formatVolume = (value: number, unit: string = "kg"): string => {
  return `${value.toLocaleString("fr-FR")} ${unit}`;
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
export const formatPercentage = (
  value: number,
  decimals: number = 1,
): string => {
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
  return value.toLocaleString("fr-FR");
};

/**
 * Arrondi toujours "vers le haut" au sens business :
 * @param value - Valeur à arrondir
 * @param decimals - Nombre de décimales
 * @returns Valeur arrondie
 *
 * @example
 * ```typescript
 * roundUp(12.345, 1) // 12.4
 */
const roundUp = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);

  return value >= 0
    ? Math.ceil(value * factor) / factor
    : Math.floor(value * factor) / factor;
};

/**
 * Arrondi standard (0.5 arrondi au supérieur)
 * @param value - Valeur à arrondir
 * @param decimals - Nombre de décimales
 * @returns Valeur arrondie
 */
const roundStandard = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Formate une valeur monétaire avec arrondi "vers le haut" et suffixe k€ ou M€
 *
 * @param value - Valeur à formater
 * @param decimals - Nombre de décimales
 * @param currency - Devise (par défaut: "€")
 * @returns Chaîne formatée avec le symbole de la devise
 *
 * @example
 * ```typescript
 * formatPrice(485000) // "485k€"
 * formatPrice(1200000) // "1.2M€"
 * formatPrice(999) // "999€"
 * formatPrice(-1500) // "-1.5k€"
 */
export const formatPrice = (
  value: number,
  decimals: number = 1,
  currency: string = "€",
): string => {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    const v = roundUp(abs / 1_000_000_000, decimals);
    return `${sign}${v.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })}B ${currency}`;
  }

  if (abs >= 1_000_000) {
    const v = roundUp(abs / 1_000_000, decimals);
    return `${sign}${v.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })}M ${currency}`;
  }

  if (abs >= 1_000) {
    const v = roundUp(abs / 1_000, decimals);
    return `${sign}${v.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })}k ${currency}`;
  }

  const v = roundUp(abs, decimals);
  return `${sign}${v.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })} ${currency}`;
};

/**
 * Formate un poids en kg ou tonnes selon le seuil
 * @param kg - Poids en kilogrammes
 * @param thresholdKg - Seuil en kg à partir duquel on affiche en tonnes
 * @param decimals - Nombre de décimales
 * @returns Chaîne formatée avec le symbole de la mesure
 *
 * @example
 * ```typescript
 * formatWeight(1250) // "1.3 t"
 * formatWeight(850)  // "850 kg"
 * formatWeight(0.75) // "0.8 kg"
 * formatWeight(-500) // "-500 kg"
 * formatWeight(-1500) // "-1.5 t"
 * ```
 */
export function formatWeight(
  kg: number,
  thresholdKg = 1000,
  decimals: number = 1,
): string {
  const safe = Number(kg) || 0;
  const sign = safe < 0 ? "-" : "";
  const abs = Math.abs(safe);

  if (abs === 0) return "-";
  // Tonnes
  if (abs >= thresholdKg) {
    const t = roundStandard(abs / KG_PER_TONNE, decimals);
    return `${sign}${t.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })} t`;
  }

  // < 1 kg
  if (abs < 1) {
    const v = roundStandard(abs, decimals);
    return `${sign}${v.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })} kg`;
  }

  // ≥ 1 kg
  const v = roundStandard(abs, decimals);
  return `${sign}${v.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })} kg`;
}
