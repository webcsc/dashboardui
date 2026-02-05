import { Building2, Zap, User, type LucideIcon } from 'lucide-react';

/**
 * Configuration d'un segment CSC
 */
export interface SegmentConfig {
    /** Label affiché */
    label: string;
    /** Valeur du segment */
    value: string;
    /** Icône Lucide associée */
    icon: LucideIcon;
    /** Couleur HSL du segment */
    color: string;
    /** Classes de styles Tailwind */
    styles: {
        border: string;
        borderAccent: string;
        bg: string;
        bgLight: string;
        bgHover: string;
        text: string;
    };
}

/**
 * Configuration des segments CSC
 * 
 * Centralise toute la configuration visuelle et les métadonnées
 * pour les trois segments principaux : Grands Comptes, Plug & Play, et B2C
 */
export const SEGMENT_CONFIG = {
    gc: {
        label: 'Grands Comptes',
        value: 'gc',
        icon: Building2,
        color: 'hsl(var(--segment-gc))',
        styles: {
            border: 'border-segment-gc',
            borderAccent: 'border-l-4 border-l-segment-gc',
            bg: 'bg-segment-gc',
            bgLight: 'bg-segment-gc/10',
            bgHover: 'hover:bg-segment-gc/20',
            text: 'text-segment-gc',
        },
    },
    pp: {
        label: 'Plug & Play',
        value: 'pp',
        icon: Zap,
        color: 'hsl(var(--segment-pp))',
        styles: {
            border: 'border-segment-pp',
            borderAccent: 'border-l-4 border-l-segment-pp',
            bg: 'bg-segment-pp',
            bgLight: 'bg-segment-pp/10',
            bgHover: 'hover:bg-segment-pp/20',
            text: 'text-segment-pp',
        },
    },
    b2c: {
        label: 'B2C',
        value: 'b2c',
        icon: User,
        color: 'hsl(var(--segment-b2c))',
        styles: {
            border: 'border-segment-b2c',
            borderAccent: 'border-l-4 border-l-segment-b2c',
            bg: 'bg-segment-b2c',
            bgLight: 'bg-segment-b2c/10',
            bgHover: 'hover:bg-segment-b2c/20',
            text: 'text-segment-b2c',
        },
    },
} as const;

/**
 * Type pour les clés de segments
 */
export type SegmentKey = keyof typeof SEGMENT_CONFIG;

/**
 * Liste des segments pour les itérations
 */
export const SEGMENTS = Object.values(SEGMENT_CONFIG);

