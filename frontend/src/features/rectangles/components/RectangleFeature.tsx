// src/features/rectangles/components/RectangleFeature.tsx
import React, { useCallback, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { StatusIndicator } from '../../../components/ui/StatusIndicator';
import { useSocket } from '../../../contexts/SocketContext';
import { useRectangles } from '../contexts/RectangleContext';
import type { Rectangle } from '../types';
import { RectangleCanvas } from './RectangleCanvas';

export interface RectangleFeatureProps {
  className?: string;
  showStats?: boolean;
  showGrid?: boolean;
  snapToGrid?: boolean;
}

export const RectangleFeature: React.FC<RectangleFeatureProps> = ({
  className = '',
  showStats = true,
  showGrid = false,
  snapToGrid = false
}) => {
  const { isConnected, connectionError } = useSocket();
  const {
    isLoading,
    error,
    addRectangle,
    clearError,
    getRectangleCount
  } = useRectangles();

  const [selectedRectangle, setSelectedRectangle] = useState<Rectangle | null>(null);
  const [hoveredRectangle, setHoveredRectangle] = useState<Rectangle | null>(null);

  // Handle adding a new rectangle
  const handleAddRectangle = useCallback(() => {
    addRectangle({
      x: Math.random() * 600,
      y: Math.random() * 400,
      width: 100,
      height: 80,
      fill: '', // Will be auto-generated
      draggable: true
    });
  }, [addRectangle]);

  // Handle rectangle selection
  const handleRectangleSelect = useCallback((rectangle: Rectangle) => {
    setSelectedRectangle(rectangle);
  }, []);

  // Handle rectangle hover
  const handleRectangleHover = useCallback((rectangle: Rectangle | null) => {
    setHoveredRectangle(rectangle);
  }, []);

  // Get connection status
  const getConnectionStatus = (): 'connected' | 'disconnected' | 'connecting' | 'error' => {
    if (connectionError) return 'error';
    if (isConnected) return 'connected';
    if (isLoading) return 'connecting';
    return 'disconnected';
  };

  return (
    <div className={`w-full min-h-screen bg-gray-50 p-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-800">
                Collaborative Canvas
              </h1>
              <StatusIndicator
                status={getConnectionStatus()}
                label={connectionError || undefined}
              />
            </div>

            {/* Stats and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {showStats && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Rectangles: {getRectangleCount()}</span>
                  {selectedRectangle && (
                    <span>Selected: {selectedRectangle.id.slice(0, 8)}...</span>
                  )}
                  {hoveredRectangle && (
                    <span>Hovered: {hoveredRectangle.id.slice(0, 8)}...</span>
                  )}
                </div>
              )}

              <Button
                onClick={handleAddRectangle}
                disabled={!isConnected || isLoading}
                loading={isLoading}
                icon={<span>+</span>}
                size="lg"
              >
                Add Rectangle
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {(error || connectionError) && (
            <div className="mt-4">
              <ErrorMessage
                message={error || connectionError || 'Unknown error'}
                onDismiss={error ? clearError : undefined}
                variant={connectionError ? 'error' : 'warning'}
              />
            </div>
          )}
        </div>

        {/* Canvas Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {isLoading && !isConnected ? (
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner
                size="xl"
                label="Connecting to canvas..."
              />
            </div>
          ) : (
            <>
              {/* Canvas Controls */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Canvas Options:
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={() => {}} // Would be controlled by parent
                    className="rounded"
                  />
                  Show Grid
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={() => {}} // Would be controlled by parent
                    className="rounded"
                  />
                  Snap to Grid
                </label>
              </div>

              {/* Canvas */}
              <RectangleCanvas
                onRectangleSelect={handleRectangleSelect}
                onRectangleHover={handleRectangleHover}
                showGrid={showGrid}
                snapToGrid={snapToGrid}
              />
            </>
          )}
        </div>

        {/* Rectangle Details Panel */}
        {selectedRectangle && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Rectangle Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">ID:</span>
                <p className="text-gray-800 font-mono">{selectedRectangle.id.slice(0, 12)}...</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Position:</span>
                <p className="text-gray-800">
                  ({Math.round(selectedRectangle.x)}, {Math.round(selectedRectangle.y)})
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Size:</span>
                <p className="text-gray-800">
                  {selectedRectangle.width} × {selectedRectangle.height}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Color:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: selectedRectangle.fill }}
                  />
                  <span className="text-gray-800 font-mono">{selectedRectangle.fill}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            How to Use
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <ul className="space-y-2">
              <li>• Click "Add Rectangle" to create new rectangles</li>
              <li>• Drag rectangles to move them around</li>
              <li>• Double-click rectangles to delete them</li>
              <li>• Hover over rectangles to see details</li>
            </ul>
            <ul className="space-y-2">
              <li>• Open multiple tabs to see real-time collaboration</li>
              <li>• All changes sync instantly across connected users</li>
              <li>• Connection status is shown in the header</li>
              <li>• Grid and snap options help with precise positioning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
