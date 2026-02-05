import { SEGMENT_CONFIG } from '@/config/segments';
import { UNIVERSE_CONFIG } from '@/config/universes';
import type { ComponentVariant, VariantStyles } from '@/types';

/**
 * Utilitaires pour gérer les variants de composants
 * @module variant-utils
 */

/**
 * Configuration par défaut pour le variant "default"
 */
const DEFAULT_VARIANT_CONFIG = {
    label: 'Default',
    value: 'default',
    styles: {
        border: 'border-primary/20',
        borderAccent: '',
        bg: 'bg-primary',
        bgLight: 'bg-primary/10',
        bgHover: 'hover:bg-primary/20',
        text: 'text-primary',
    },
};

/**
 * Retourne la configuration complète d'un variant
 * 
 * @param variant - Type de variant
 * @returns Configuration du variant ou null si non trouvé
 * 
 * @example
 * ```typescript
 * getVariantConfig('gc')
 * // Returns segment GC configuration
 * ```
 */
export function getVariantConfig(variant: ComponentVariant) {
    if (variant === 'default') {
        return DEFAULT_VARIANT_CONFIG;
    }

    // Vérifier dans les segments
    if (variant in SEGMENT_CONFIG) {
        return SEGMENT_CONFIG[variant as keyof typeof SEGMENT_CONFIG];
    }

    // Vérifier dans les univers
    if (variant in UNIVERSE_CONFIG) {
        return UNIVERSE_CONFIG[variant as keyof typeof UNIVERSE_CONFIG];
    }

    // Retourner default si variant non trouvé
    return DEFAULT_VARIANT_CONFIG;
}

/**
 * Retourne uniquement les styles d'un variant
 * 
 * @param variant - Type de variant
 * @returns Objet VariantStyles
 */
export function getVariantStyles(variant: ComponentVariant): VariantStyles {
    const config = getVariantConfig(variant);
    return config.styles;
}

/**
 * Retourne la classe CSS pour la bordure accent (border-left)
 * Utilisé principalement pour les KPI cards
 * 
 * @param variant - Type de variant
 * @returns Classe CSS Tailwind
 * 
 * @example
 * ```typescript
 * getAccentBorderClass('gc') // "border-l-4 border-l-segment-gc"
 * ```
 */
export function getAccentBorderClass(variant: ComponentVariant): string {
    const styles = getVariantStyles(variant);
    return styles.borderAccent || '';
}

/**
 * Retourne la classe CSS pour le background
 * 
 * @param variant - Type de variant
 * @returns Classe CSS Tailwind
 */
export function getBackgroundClass(variant: ComponentVariant): string {
    const styles = getVariantStyles(variant);
    return styles.bg || '';
}

/**
 * Retourne la classe CSS pour le texte
 * 
 * @param variant - Type de variant
 * @returns Classe CSS Tailwind
 */
export function getTextClass(variant: ComponentVariant): string {
    const styles = getVariantStyles(variant);
    return styles.text || '';
}

/**
 * Vérifie si un variant est un segment
 * 
 * @param variant - Type de variant
 * @returns true si c'est un segment (gc, pp, b2c)
 */
export function isSegmentVariant(variant: ComponentVariant): boolean {
    return variant in SEGMENT_CONFIG;
}

/**
 * Vérifie si un variant est un univers
 * 
 * @param variant - Type de variant
 * @returns true si c'est un univers (cafe, equipement, service)
 */
export function isUniverseVariant(variant: ComponentVariant): boolean {
    return variant in UNIVERSE_CONFIG;
}

