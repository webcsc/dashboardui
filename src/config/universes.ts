import { Coffee, Settings, Wrench, type LucideIcon } from 'lucide-react';

/**
 * Configuration d'un univers produit
 */
export interface UniverseConfig {
    /** Label affiché */
    label: string;
    /** Valeur de l'univers */
    value: string;
    /** Icône Lucide associée */
    icon: LucideIcon;
    /** Couleur HSL de l'univers */
    color: string;
    /** Classes de styles Tailwind */
    styles: {
        headerBg: string;
        headerText: string;
        border: string;
        borderLight: string;
        bg: string;
        text: string;
    };
}

/**
 * Configuration des univers produits
 * 
 * Centralise toute la configuration visuelle et les métadonnées
 * pour les trois univers : Café, Équipement, et Service
 */
export const UNIVERSE_CONFIG = {
    cafe: {
        label: 'Café',
        value: 'cafe',
        icon: Coffee,
        color: 'hsl(var(--universe-cafe))',
        styles: {
            headerBg: 'bg-universe-cafe-light',
            headerText: 'text-universe-cafe',
            border: 'border-universe-cafe',
            borderLight: 'border-universe-cafe/20',
            bg: 'bg-universe-cafe',
            text: 'text-universe-cafe',
        },
    },
    equipement: {
        label: 'Équipement',
        value: 'equipement',
        icon: Settings,
        color: 'hsl(var(--universe-equipement))',
        styles: {
            headerBg: 'bg-universe-equipement-light',
            headerText: 'text-universe-equipement',
            border: 'border-universe-equipement',
            borderLight: 'border-universe-equipement/20',
            bg: 'bg-universe-equipement',
            text: 'text-universe-equipement',
        },
    },
    service: {
        label: 'Service',
        value: 'service',
        icon: Wrench,
        color: 'hsl(var(--universe-service))',
        styles: {
            headerBg: 'bg-universe-service-light',
            headerText: 'text-universe-service',
            border: 'border-universe-service',
            borderLight: 'border-universe-service/20',
            bg: 'bg-universe-service',
            text: 'text-universe-service',
        },
    },
} as const;

/**
 * Type pour les clés d'univers
 */
export type UniverseKey = keyof typeof UNIVERSE_CONFIG;

/**
 * Liste des univers pour les itérations
 */
export const UNIVERSES = Object.values(UNIVERSE_CONFIG);

