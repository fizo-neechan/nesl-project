
// src/features/rectangles/hooks/useRectangleValidation.ts
import { useCallback } from 'react';
import type { CreateRectangleDTO, StageSize, ValidationResult } from '../types';

export const useRectangleValidation = (stageSize: StageSize) => {
  const validateRectangle = useCallback((rectangle: Partial<CreateRectangleDTO>): ValidationResult => {
    const errors: string[] = [];

    // Validate position
    if (typeof rectangle.x !== 'number' || rectangle.x < 0) {
      errors.push('X position must be a non-negative number');
    }
    if (typeof rectangle.y !== 'number' || rectangle.y < 0) {
      errors.push('Y position must be a non-negative number');
    }

    // Validate dimensions
    if (typeof rectangle.width !== 'number' || rectangle.width <= 0) {
      errors.push('Width must be a positive number');
    }
    if (typeof rectangle.height !== 'number' || rectangle.height <= 0) {
      errors.push('Height must be a positive number');
    }

    // Validate bounds
    if (rectangle.x && rectangle.width && (rectangle.x + rectangle.width) > stageSize.width) {
      errors.push('Rectangle extends beyond canvas width');
    }
    if (rectangle.y && rectangle.height && (rectangle.y + rectangle.height) > stageSize.height) {
      errors.push('Rectangle extends beyond canvas height');
    }

    // Validate color
    if (rectangle.fill && typeof rectangle.fill !== 'string') {
      errors.push('Fill color must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [stageSize]);

  const validatePosition = useCallback((x: number, y: number, width: number = 0, height: number = 0): ValidationResult => {
    const errors: string[] = [];

    if (x < 0) errors.push('X position cannot be negative');
    if (y < 0) errors.push('Y position cannot be negative');
    if (x + width > stageSize.width) errors.push('Rectangle extends beyond canvas width');
    if (y + height > stageSize.height) errors.push('Rectangle extends beyond canvas height');

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [stageSize]);

  return {
    validateRectangle,
    validatePosition
  };
};
