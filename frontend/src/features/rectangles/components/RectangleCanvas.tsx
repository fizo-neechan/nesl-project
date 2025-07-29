// src/features/rectangles/components/RectangleCanvas.tsx
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import React, { useCallback, useRef } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { useRectangles } from '../contexts/RectangleContext';
import { useRectangleCanvas } from '../hooks/useRectangleCanvas';
import { useRectangleInteraction } from '../hooks/useRectangleInteraction';
import { useRectangleValidation } from '../hooks/useRectangleValidation';
import type { Rectangle } from '../types';

export interface RectangleCanvasProps {
  className?: string;
  onRectangleSelect?: (rectangle: Rectangle) => void;
  onRectangleHover?: (rectangle: Rectangle | null) => void;
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

export const RectangleCanvas: React.FC<RectangleCanvasProps> = ({
  className = '',
  onRectangleSelect,
  onRectangleHover,
  showGrid = false,
  snapToGrid = false,
  gridSize = 20
}) => {
  const { rectangles, moveRectangle, deleteRectangle } = useRectangles();
  const { stageSize, containerRef, config } = useRectangleCanvas();
  const {
    interaction,
    startDrag,
    endDrag,
    setHover,
    isSelected,
    isHovered,
    selectRectangle
  } = useRectangleInteraction();
  const { validatePosition } = useRectangleValidation(stageSize);

  const stageRef = useRef<Konva.Stage>(null);

  // Snap position to grid if enabled
  const snapPosition = useCallback((x: number, y: number) => {
    if (!snapToGrid) return { x, y };

    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [snapToGrid, gridSize]);

  // Handle rectangle drag start
  const handleDragStart = useCallback((e: KonvaEventObject<DragEvent>, rectangleId: string) => {
    startDrag(rectangleId);
    selectRectangle(rectangleId);
  }, [startDrag, selectRectangle]);

  // Handle rectangle drag move
  const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>, rectangleId: string) => {
    const target = e.target as Konva.Rect;
    let newX = target.x();
    let newY = target.y();

    // Snap to grid if enabled
    if (snapToGrid) {
      const snapped = snapPosition(newX, newY);
      newX = snapped.x;
      newY = snapped.y;
      target.position(snapped);
    }

    // Validate position
    const rectangle = rectangles.find(r => r.id === rectangleId);
    if (rectangle) {
      const validation = validatePosition(newX, newY, rectangle.width, rectangle.height);
      if (validation.isValid) {
        moveRectangle(rectangleId, newX, newY);
      }
    }
  }, [snapToGrid, snapPosition, validatePosition, rectangles, moveRectangle]);

  // Handle rectangle drag end
  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>, rectangleId: string) => {
    endDrag();

    const target = e.target as Konva.Rect;
    let finalX = target.x();
    let finalY = target.y();

    // Final snap to grid
    if (snapToGrid) {
      const snapped = snapPosition(finalX, finalY);
      finalX = snapped.x;
      finalY = snapped.y;
      target.position(snapped);
    }

    // Final position update
    const rectangle = rectangles.find(r => r.id === rectangleId);
    if (rectangle) {
      const validation = validatePosition(finalX, finalY, rectangle.width, rectangle.height);
      if (validation.isValid) {
        moveRectangle(rectangleId, finalX, finalY);
      }
    }
  }, [endDrag, snapToGrid, snapPosition, validatePosition, rectangles, moveRectangle]);

  // Handle rectangle mouse enter
  const handleMouseEnter = useCallback((e: KonvaEventObject<MouseEvent>, rectangle: Rectangle) => {
    const target = e.target as Konva.Rect;
    target.to({
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 0.1,
    });

    document.body.style.cursor = 'move';
    setHover(rectangle.id);
    onRectangleHover?.(rectangle);
  }, [setHover, onRectangleHover]);

  // Handle rectangle mouse leave
  const handleMouseLeave = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const target = e.target as Konva.Rect;
    target.to({
      scaleX: 1,
      scaleY: 1,
      duration: 0.1,
    });

    document.body.style.cursor = 'default';
    setHover(null);
    onRectangleHover?.(null);
  }, [setHover, onRectangleHover]);

  // Handle rectangle click
  const handleClick = useCallback((rectangle: Rectangle) => {
    selectRectangle(rectangle.id);
    onRectangleSelect?.(rectangle);
  }, [selectRectangle, onRectangleSelect]);

  // Handle rectangle double click (delete)
  const handleDoubleClick = useCallback((rectangle: Rectangle) => {
    deleteRectangle(rectangle.id);
  }, [deleteRectangle]);

  // Get rectangle style based on state
  const getRectangleStyle = useCallback((rectangle: Rectangle) => {
    const isRectSelected = isSelected(rectangle.id);
    const isRectHovered = isHovered(rectangle.id);

    return {
      fill: rectangle.fill,
      stroke: isRectSelected ? '#3b82f6' : isRectHovered ? '#6b7280' : 'transparent',
      strokeWidth: isRectSelected ? 3 : isRectHovered ? 2 : 0,
      shadowColor: 'black',
      shadowBlur: isRectHovered ? 15 : 10,
      shadowOpacity: isRectHovered ? 0.3 : 0.2,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
    };
  }, [isSelected, isHovered]);

  // Render grid if enabled
  const renderGrid = useCallback(() => {
    if (!showGrid) return null;

    const lines = [];
    const { width, height } = stageSize;

    // Vertical lines
    for (let i = 0; i <= width; i += gridSize) {
      lines.push(
        <Rect
          key={`v-${i}`}
          x={i}
          y={0}
          width={1}
          height={height}
          fill="#e5e7eb"
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= height; i += gridSize) {
      lines.push(
        <Rect
          key={`h-${i}`}
          x={0}
          y={i}
          width={width}
          height={1}
          fill="#e5e7eb"
          listening={false}
        />
      );
    }

    return lines;
  }, [showGrid, stageSize, gridSize]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: `${stageSize.height}px`
      }}
    >
      <div
        className="rounded-lg overflow-hidden shadow-lg"
        style={{
          backgroundColor: config.backgroundColor,
          border: `${config.border.width}px ${config.border.style} ${config.border.color}`
        }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          ref={stageRef}
        >
          <Layer>
            {/* Grid */}
            {renderGrid()}

            {/* Rectangles */}
            {rectangles.map((rectangle: Rectangle) => {
              const style = getRectangleStyle(rectangle);

              return (
                <Rect
                  key={rectangle.id}
                  id={rectangle.id}
                  x={rectangle.x}
                  y={rectangle.y}
                  width={rectangle.width}
                  height={rectangle.height}
                  draggable={rectangle.draggable}
                  {...style}
                  onDragStart={(e) => handleDragStart(e, rectangle.id)}
                  onDragMove={(e) => handleDragMove(e, rectangle.id)}
                  onDragEnd={(e) => handleDragEnd(e, rectangle.id)}
                  onMouseEnter={(e) => handleMouseEnter(e, rectangle)}
                  onMouseLeave={(e) => handleMouseLeave(e)}
                  onClick={() => handleClick(rectangle)}
                  onDblClick={() => handleDoubleClick(rectangle)}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* Canvas Info Overlay */}
      {interaction.isDragging && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
          Dragging: {interaction.draggedId}
        </div>
      )}
    </div>
  );
};
