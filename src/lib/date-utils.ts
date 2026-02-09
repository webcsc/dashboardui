import {
    startOfMonth, endOfMonth, subMonths,
    startOfQuarter, endOfQuarter, subQuarters,
    startOfYear, endOfYear, subYears,
} from 'date-fns';
import type { DateRange } from '@/types';

/**
 * Utilitaires pour la gestion des dates
 * @module date-utils
 */

/**
 * Retourne les dates de début et fin selon un preset de période
 * 
 * @param preset - Identifiant du preset ('current-month', 'last-month', etc.)
 * @returns Objet DateRange avec dates de début et fin
 * 
 * @example
 * ```typescript
 * getPeriodDates('current-month')
 * // { start: Date(2026-02-01), end: Date(2026-02-28) }
 * ```
 */
export function getPeriodDates(preset: string): DateRange {
    const now = new Date();

    switch (preset) {
        case 'current-month':
            return { start: startOfMonth(now), end: endOfMonth(now) };

        case 'last-month':
            return {
                start: startOfMonth(subMonths(now, 1)),
                end: endOfMonth(subMonths(now, 1)),
            };

        case "current-quarter": {
            return {
                start: startOfMonth(subMonths(now, 2)),
                end: endOfMonth(now)
            };
        }

        case "last-quarter": {
            return {
                start: startOfMonth(subMonths(now, 5)),
                end: endOfMonth(subMonths(now, 3))
            };
        }

        case 'current-year':
            return { start: startOfYear(now), end: endOfYear(now) };

        case 'last-year':
            return {
                start: startOfYear(subYears(now, 1)),
                end: endOfYear(subYears(now, 1)),
            };

        default:
            // Par défaut, retourne le mois en cours
            return { start: startOfMonth(now), end: endOfMonth(now) };
    }
}

/**
 * Calcule la période de comparaison équivalente
 * Retourne une période de même durée, immédiatement avant la période donnée
 * 
 * @param period - Période de référence
 * @returns Période de comparaison (même durée, juste avant)
 * 
 * @example
 * ```typescript
 * // Si period = 1er au 31 janvier
 * getComparePeriodDates(period)
 * // Retourne 1er au 31 décembre
 * ```
 */
export function getComparePeriodDates(period: DateRange): DateRange {
    const start = period.start;
    const end = period.end;

    // Check for Full Month
    if (start.getDate() === 1 &&
        end.getDate() === endOfMonth(start).getDate() &&
        start.getMonth() === end.getMonth()) {
        const prevStart = startOfMonth(subMonths(start, 1));
        return { start: prevStart, end: endOfMonth(prevStart) };
    }

    // Check for Full Year
    if (start.getDate() === 1 && start.getMonth() === 0 &&
        end.getDate() === 31 && end.getMonth() === 11) {
        const prevStart = startOfYear(subYears(start, 1));
        return { start: prevStart, end: endOfYear(prevStart) };
    }

    // Default: Sliding window of same duration
    const diff = end.getTime() - start.getTime();
    const compareEnd = new Date(start.getTime() - 1);
    const compareStart = new Date(compareEnd.getTime() - diff);
    return { start: compareStart, end: compareEnd };
}

/**
 * Vérifie si deux périodes se chevauchent
 * 
 * @param period1 - Première période
 * @param period2 - Deuxième période
 * @returns true si les périodes se chevauchent
 */
export function periodsOverlap(period1: DateRange, period2: DateRange): boolean {
    return period1.start <= period2.end && period2.start <= period1.end;
}

/**
 * Calcule la durée d'une période en jours
 * 
 * @param period - Période à mesurer
 * @returns Nombre de jours
 */
export function getPeriodDurationInDays(period: DateRange): number {
    const diffTime = Math.abs(period.end.getTime() - period.start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

