// src/features/rectangles/types/index.ts

export interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  draggable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRectangleDTO {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  draggable: boolean;
}

export interface MoveData {
  id: string;
  x: number;
  y: number;
}

export interface StageSize {
  width: number;
  height: number;
}

export interface RectangleConfig {
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  defaultDraggable: boolean;
  colors: string[];
}

export interface CanvasConfig {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  defaultWidth: number;
  defaultHeight: number;
  backgroundColor: string;
  border: {
    width: number;
    color: string;
    style: string;
  };
}

// Event handler types
export type RectangleEventHandler = (rectangle: Rectangle) => void;
export type RectangleMoveHandler = (id: string, x: number, y: number) => void;
export type RectangleDeleteHandler = (id: string) => void;

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Rectangle selection/interaction types
export interface RectangleSelection {
  selectedIds: string[];
  isMultiSelect: boolean;
}

export interface RectangleInteraction {
  isDragging: boolean;
  draggedId: string | null;
  hoveredId: string | null;
}
