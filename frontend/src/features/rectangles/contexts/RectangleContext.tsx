// src/features/rectangles/contexts/RectangleContext.tsx
import type { ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import type { CreateRectangleDTO, MoveData, Rectangle } from '../types';

// Rectangle-specific events (matching backend)
interface RectangleServerToClientEvents {
  'rectangles:init': (rectangles: Rectangle[]) => void;
  'rectangle:added': (rectangle: Rectangle) => void;
  'rectangle:moved': (moveData: MoveData) => void;
  'rectangle:deleted': (rectangleId: string) => void;
}

interface RectangleClientToServerEvents {
  'rectangle:add': (rectangle: CreateRectangleDTO) => void;
  'rectangle:move': (moveData: MoveData) => void;
  'rectangle:delete': (rectangleId: string) => void;
}

export interface RectangleContextValue {
  rectangles: Rectangle[];
  isLoading: boolean;
  error: string | null;
  addRectangle: (rectangle: Omit<CreateRectangleDTO, 'id'>) => void;
  moveRectangle: (id: string, x: number, y: number) => void;
  deleteRectangle: (id: string) => void;
  clearError: () => void;
  // Utility methods
  getRectangleById: (id: string) => Rectangle | undefined;
  getRectangleCount: () => number;
  clearAllRectangles: () => void;
}

interface RectangleProviderProps {
  children: ReactNode;
}

const RectangleContext = createContext<RectangleContextValue | null>(null);

export const RectangleProvider: React.FC<RectangleProviderProps> = ({ children }) => {
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, emit, on } = useSocket<RectangleServerToClientEvents, RectangleClientToServerEvents>();

  // Generate unique ID for rectangles
  const generateId = useCallback((): string => {
    return `rect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Generate random color
  const getRandomColor = useCallback((): string => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
      '#ffeaa7', '#dda0dd', '#98d8c8', '#fd79a8',
      '#fdcb6e', '#6c5ce7', '#a29bfe', '#74b9ff'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!isConnected) return;

    // Handle initial rectangles
    const unsubscribeInit = on('rectangles:init', (initialRectangles: Rectangle[]) => {
      console.log('📦 Received initial rectangles:', initialRectangles.length);
      setRectangles(initialRectangles);
      setIsLoading(false);
      setError(null);
    });

    // Handle new rectangles from other clients
    const unsubscribeAdded = on('rectangle:added', (rectangle: Rectangle) => {
      console.log('➕ Rectangle added by another client:', rectangle.id);
      setRectangles(prev => {
        // Prevent duplicates
        const exists = prev.some(r => r.id === rectangle.id);
        if (exists) return prev;
        return [...prev, rectangle];
      });
    });

    // Handle rectangle movements from other clients
    const unsubscribeMoved = on('rectangle:moved', (moveData: MoveData) => {
      console.log('🔄 Rectangle moved by another client:', moveData.id);
      setRectangles(prev =>
        prev.map(rect =>
          rect.id === moveData.id
            ? { ...rect, x: moveData.x, y: moveData.y }
            : rect
        )
      );
    });

    // Handle rectangle deletions from other clients
    const unsubscribeDeleted = on('rectangle:deleted', (rectangleId: string) => {
      console.log('❌ Rectangle deleted by another client:', rectangleId);
      setRectangles(prev => prev.filter(rect => rect.id !== rectangleId));
    });

    // Cleanup function
    return () => {
      unsubscribeInit();
      unsubscribeAdded();
      unsubscribeMoved();
      unsubscribeDeleted();
    };
  }, [isConnected, on]);

  // Handle connection status changes
  useEffect(() => {
    if (isConnected) {
      setError(null);
    } else {
      setIsLoading(true);
      setError('Disconnected from server');
    }
  }, [isConnected]);

  // Add rectangle
  const addRectangle = useCallback((rectangleData: Omit<CreateRectangleDTO, 'id'>) => {
    if (!isConnected) {
      setError('Cannot add rectangle: not connected to server');
      return;
    }

    const newRectangle: CreateRectangleDTO = {
      id: generateId(),
      ...rectangleData,
      fill: rectangleData.fill || getRandomColor(),
    };

    try {
      // Add to local state immediately for responsive UI
      const fullRectangle: Rectangle = {
        ...newRectangle,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setRectangles(prev => [...prev, fullRectangle]);

      // Emit to server
      emit('rectangle:add', newRectangle);

      console.log('➕ Added rectangle locally:', newRectangle.id);
    } catch (err) {
      setError(`Failed to add rectangle: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error adding rectangle:', err);
    }
  }, [isConnected, generateId, getRandomColor, emit]);

  // Move rectangle
  const moveRectangle = useCallback((id: string, x: number, y: number) => {
    if (!isConnected) {
      console.warn('Cannot move rectangle: not connected to server');
      return;
    }

    try {
      // Update local state immediately for responsive UI
      setRectangles(prev =>
        prev.map(rect =>
          rect.id === id
            ? { ...rect, x, y, updatedAt: new Date() }
            : rect
        )
      );

      // Emit to server
      const moveData: MoveData = { id, x, y };
      emit('rectangle:move', moveData);

      console.log('🔄 Moved rectangle locally:', id, `(${x}, ${y})`);
    } catch (err) {
      setError(`Failed to move rectangle: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error moving rectangle:', err);
    }
  }, [isConnected, emit]);

  // Delete rectangle
  const deleteRectangle = useCallback((id: string) => {
    if (!isConnected) {
      setError('Cannot delete rectangle: not connected to server');
      return;
    }

    try {
      // Remove from local state immediately for responsive UI
      setRectangles(prev => prev.filter(rect => rect.id !== id));

      // Emit to server
      emit('rectangle:delete', id);

      console.log('❌ Deleted rectangle locally:', id);
    } catch (err) {
      setError(`Failed to delete rectangle: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error deleting rectangle:', err);
    }
  }, [isConnected, emit]);

  // Utility methods
  const getRectangleById = useCallback((id: string): Rectangle | undefined => {
    return rectangles.find(rect => rect.id === id);
  }, [rectangles]);

  const getRectangleCount = useCallback((): number => {
    return rectangles.length;
  }, [rectangles.length]);

  const clearAllRectangles = useCallback(() => {
    setRectangles([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: RectangleContextValue = {
    rectangles,
    isLoading,
    error,
    addRectangle,
    moveRectangle,
    deleteRectangle,
    clearError,
    getRectangleById,
    getRectangleCount,
    clearAllRectangles
  };

  return (
    <RectangleContext.Provider value={contextValue}>
      {children}
    </RectangleContext.Provider>
  );
};

// Hook to use rectangle context
export const useRectangles = (): RectangleContextValue => {
  const context = useContext(RectangleContext);
  if (!context) {
    throw new Error('useRectangles must be used within a RectangleProvider');
  }
  return context;
};
