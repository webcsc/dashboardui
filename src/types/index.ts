/**
 * Types communs pour le dashboard CSC
 * @module types
 */

/**
 * Définition d'une colonne de tableau
 */
export interface TableColumn {
    /** Clé de la colonne dans les données */
    key: string;
    /** Label affiché dans l'en-tête */
    label: string;
    /** Fonction de formatage optionnelle pour la valeur */
    format?: (value: number) => string;
    /** Indique si la colonne est filtrable */
    filterable?: boolean;
    /** Type de filtre à appliquer */
    filterType?: "text" | "select";
    width?: string;
}

/**
 * Plage de dates
 */
export interface DateRange {
    /** Date de début */
    start: Date;
    /** Date de fin */
    end: Date;
}

/**
 * État des filtres du dashboard
 */
export interface FilterState {
    /** Période sélectionnée */
    period: DateRange;
    /** Période de comparaison (optionnelle) */
    comparePeriod?: DateRange;
    /** Segments sélectionnés */
    segments: string[];
    /** Régions sélectionnées */
    regions: string[];
    /** Types de clients sélectionnés */
    clientTypes: string[];
    /** ID du client B2B sélectionné (optionnel) */
    clientId?: string;
}

/**
 * Props de base pour les composants View
 */
export interface BaseViewProps {
    /** Filtres appliqués */
    filters: FilterState;
    /** Indique si le mode comparaison est actif */
    isComparing: boolean;
}

/**
 * Variants de segments CSC
 */
export type SegmentVariant = "gc" | "pp" | "b2c";

/**
 * Variants d'univers produit
 */
export type UniverseVariant = "cafe" | "equipement" | "service";

/**
 * Tous les variants de composants possibles
 */
export type ComponentVariant = "default" | SegmentVariant | UniverseVariant;

/**
 * Données de tendance
 */
export interface TrendData {
    /** Valeur de la tendance en pourcentage */
    value?: number;
    /** Label personnalisé pour la tendance */
    label?: string;
    /** Indique si la tendance est positive */
    isPositive: boolean;
    /** Indique si la tendance est neutre */
    isNeutral: boolean;
}

/**
 * Données d'un KPI
 */
export interface KpiData {
    /** Label du KPI */
    label: string;
    /** Valeur formatée du KPI */
    value: string;
    /** Données de tendance (optionnel) */
    trend?: TrendData;
    /** Icône associée (optionnel) */
    icon?: React.ReactNode;
}

/**
 * Configuration de style pour un variant
 */
export interface VariantStyles {
    /** Classe CSS pour la bordure */
    border?: string;
    /** Classe CSS pour la bordure accent */
    borderAccent?: string;
    /** Classe CSS pour le background */
    bg?: string;
    /** Classe CSS pour le background light */
    bgLight?: string;
    /** Classe CSS pour le hover background */
    bgHover?: string;
    /** Classe CSS pour le texte */
    text?: string;
    /** Classe CSS pour l'en-tête background */
    headerBg?: string;
    /** Classe CSS pour l'en-tête texte */
    headerText?: string;
    /** Classe CSS pour la bordure light */
    borderLight?: string;
}

