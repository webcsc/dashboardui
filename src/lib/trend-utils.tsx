import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendData } from '@/types';

/**
 * Utilitaires pour la gestion des tendances
 * @module trend-utils
 */

/**
 * Retourne l'icône React appropriée selon la tendance
 * 
 * @param trend - Valeur de tendance en pourcentage (peut être undefined)
 * @returns Composant icône Lucide (TrendingUp, TrendingDown, ou Minus)
 * 
 * @example
 * ```tsx
 * getTrendIcon(8.2)  // <TrendingUp />
 * getTrendIcon(-3.5) // <TrendingDown />
 * getTrendIcon(0)    // <Minus />
 * ```
 */
export const getTrendIcon = (trend?: number) => {
    if (!trend || trend === 0) {
        return <Minus className="h-4 w-4" aria-hidden="true" />;
    }
    return trend > 0
        ? <TrendingUp className="h-4 w-4" aria-hidden="true" />
        : <TrendingDown className="h-4 w-4" aria-hidden="true" />;
};

/**
 * Retourne la classe CSS Tailwind pour styliser la tendance
 * 
 * @param trend - Valeur de tendance en pourcentage
 * @returns Classe CSS appropriée
 * 
 * @example
 * ```tsx
 * getTrendClass(8.2)  // "kpi-trend-up"
 * getTrendClass(-3.5) // "kpi-trend-down"
 * getTrendClass(0)    // "text-muted-foreground"
 * ```
 */
export const getTrendClass = (trend?: number): string => {
    if (!trend || trend === 0) return "text-muted-foreground";
    return trend > 0 ? "kpi-trend-up" : "kpi-trend-down";
};

/**
 * Calcule les données de tendance à partir de valeurs actuelle et précédente
 * 
 * @param current - Valeur actuelle
 * @param previous - Valeur précédente
 * @returns Objet TrendData avec calculs
 * 
 * @example
 * ```typescript
 * calculateTrend(108, 100) // { value: 8, isPositive: true, isNeutral: false }
 * ```
 */
export const calculateTrend = (current: number, previous: number): TrendData => {
    if (previous === 0) {
        return {
            value: 0,
            isPositive: false,
            isNeutral: true,
        };
    }

    const value = ((current - previous) / previous) * 100;
    return {
        value,
        isPositive: value > 0,
        isNeutral: value === 0,
    };
};

/**
 * Formate le texte d'une tendance pour l'accessibilité
 * 
 * @param trend - Valeur de tendance
 * @returns Texte descriptif pour screen readers
 * 
 * @example
 * ```typescript
 * getTrendAriaLabel(8.2)  // "hausse de 8.2%"
 * getTrendAriaLabel(-3.5) // "baisse de 3.5%"
 * ```
 */
export const getTrendAriaLabel = (trend?: number): string => {
    if (!trend || trend === 0) {
        return "stable";
    }
    const direction = trend > 0 ? "hausse" : "baisse";
    return `${direction} de ${Math.abs(trend)}%`;
};

