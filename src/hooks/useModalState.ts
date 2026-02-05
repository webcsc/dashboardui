import { useState, useCallback } from 'react';

/**
 * Hook pour gérer l'état de plusieurs modals
 * 
 * Permet de centraliser la gestion d'ouverture/fermeture de multiples modals
 * avec une API simple et cohérente.
 * 
 * @param modalIds - Liste des identifiants de modals à gérer
 * @returns Objet contenant l'état des modals et les fonctions de contrôle
 * 
 * @example
 * ```tsx
 * const { openModals, openModal, closeModal } = useModalState(['format', 'evolution']);
 * 
 * <DataTableModal 
 *   open={openModals.format} 
 *   onOpenChange={(open) => open ? openModal('format') : closeModal('format')}
 * />
 * ```
 */
export function useModalState(modalIds: string[]) {
    // Initialiser tous les modals à fermé
    const [openModals, setOpenModals] = useState<Record<string, boolean>>(() =>
        modalIds.reduce((acc, id) => ({ ...acc, [id]: false }), {})
    );

    /**
     * Ouvre un modal spécifique
     */
    const openModal = useCallback((id: string) => {
        setOpenModals(prev => ({ ...prev, [id]: true }));
    }, []);

    /**
     * Ferme un modal spécifique
     */
    const closeModal = useCallback((id: string) => {
        setOpenModals(prev => ({ ...prev, [id]: false }));
    }, []);

    /**
     * Toggle l'état d'un modal
     */
    const toggleModal = useCallback((id: string) => {
        setOpenModals(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    /**
     * Ferme tous les modals
     */
    const closeAll = useCallback(() => {
        setOpenModals(prev =>
            Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
        );
    }, []);

    /**
     * Vérifie si au moins un modal est ouvert
     */
    const isAnyOpen = Object.values(openModals).some(Boolean);

    return {
        openModals,
        openModal,
        closeModal,
        toggleModal,
        closeAll,
        isAnyOpen,
    };
}

