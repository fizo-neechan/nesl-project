// src/features/rectangles/hooks/useRectangleCanvas.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CanvasConfig, StageSize } from '../types';

export const useRectangleCanvas = (config?: Partial<CanvasConfig>) => {
  // Memoize the config to prevent recreating it on every render
  const defaultConfig: CanvasConfig = useMemo(() => ({
    minWidth: 400,
    maxWidth: 1200,
    minHeight: 300,
    maxHeight: 800,
    defaultWidth: 800,
    defaultHeight: 600,
    backgroundColor: '#f8f9fa',
    border: {
      width: 2,
      color: '#dee2e6',
      style: 'solid'
    },
    ...config
  }), [config]);

  const [stageSize, setStageSize] = useState<StageSize>({
    width: defaultConfig.defaultWidth,
    height: defaultConfig.defaultHeight
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const updateStageSize = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const newWidth = Math.max(
        defaultConfig.minWidth,
        Math.min(containerWidth - 40, defaultConfig.maxWidth)
      );

      const newHeight = Math.max(
        defaultConfig.minHeight,
        Math.min(containerHeight - 40, defaultConfig.maxHeight)
      );

      setStageSize(prevSize => {
        // Only update if size actually changed to prevent unnecessary re-renders
        if (prevSize.width !== newWidth || prevSize.height !== newHeight) {
          return { width: newWidth, height: newHeight };
        }
        return prevSize;
      });
    } else {
      // Fallback to window size
      const newWidth = Math.max(
        defaultConfig.minWidth,
        Math.min(window.innerWidth - 40, defaultConfig.maxWidth)
      );

      const newHeight = Math.max(
        defaultConfig.minHeight,
        Math.min(window.innerHeight - 200, defaultConfig.maxHeight)
      );

      setStageSize(prevSize => {
        // Only update if size actually changed
        if (prevSize.width !== newWidth || prevSize.height !== newHeight) {
          return { width: newWidth, height: newHeight };
        }
        return prevSize;
      });
    }
  }, [defaultConfig.minWidth, defaultConfig.maxWidth, defaultConfig.minHeight, defaultConfig.maxHeight]);

  useEffect(() => {
    updateStageSize();
    window.addEventListener('resize', updateStageSize);

    return () => {
      window.removeEventListener('resize', updateStageSize);
    };
  }, [updateStageSize]);

  return {
    stageSize,
    containerRef,
    updateStageSize,
    config: defaultConfig
  };
};
