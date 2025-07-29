// src/features/rectangles/hooks/useRectangleInteraction.ts
import { useCallback, useState } from 'react';

import type { RectangleInteraction, RectangleSelection } from '../types';

export const useRectangleInteraction = () => {
  const [selection, setSelection] = useState<RectangleSelection>({
    selectedIds: [],
    isMultiSelect: false
  });

  const [interaction, setInteraction] = useState<RectangleInteraction>({
    isDragging: false,
    draggedId: null,
    hoveredId: null
  });

  const selectRectangle = useCallback((id: string, multiSelect: boolean = false) => {
    setSelection(prev => {
      if (multiSelect) {
        const isSelected = prev.selectedIds.includes(id);
        return {
          selectedIds: isSelected
            ? prev.selectedIds.filter(selectedId => selectedId !== id)
            : [...prev.selectedIds, id],
          isMultiSelect: true
        };
      } else {
        return {
          selectedIds: [id],
          isMultiSelect: false
        };
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({
      selectedIds: [],
      isMultiSelect: false
    });
  }, []);

  const startDrag = useCallback((id: string) => {
    setInteraction(prev => ({
      ...prev,
      isDragging: true,
      draggedId: id
    }));
  }, []);

  const endDrag = useCallback(() => {
    setInteraction(prev => ({
      ...prev,
      isDragging: false,
      draggedId: null
    }));
  }, []);

  const setHover = useCallback((id: string | null) => {
    setInteraction(prev => ({
      ...prev,
      hoveredId: id
    }));
  }, []);

  const isSelected = useCallback((id: string): boolean => {
    return selection.selectedIds.includes(id);
  }, [selection.selectedIds]);

  const isHovered = useCallback((id: string): boolean => {
    return interaction.hoveredId === id;
  }, [interaction.hoveredId]);

  const isDraggedRectangle = useCallback((id: string): boolean => {
    return interaction.draggedId === id;
  }, [interaction.draggedId]);

  return {
    selection,
    interaction,
    selectRectangle,
    clearSelection,
    startDrag,
    endDrag,
    setHover,
    isSelected,
    isHovered,
    isDraggedRectangle
  };
};
