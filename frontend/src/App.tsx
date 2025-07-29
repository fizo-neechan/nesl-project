// src/App.tsx
import React from 'react';
import './App.css';
import { SocketProvider } from './contexts/SocketContext';
import { RectangleFeature } from './features/rectangles/components/RectangleFeature';
import { RectangleProvider } from './features/rectangles/contexts/RectangleContext';

const App: React.FC = () => {
  return (
    <div className="App">
      {/* Socket Provider for Rectangles namespace */}
      <SocketProvider
        namespace="/rectangles"
        serverUrl="http://localhost:3001"
        autoConnect={true}
        reconnection={true}
        reconnectionAttempts={5}
        reconnectionDelay={1000}
        onConnect={() => console.log('🎉 Connected to rectangles namespace')}
        onDisconnect={(reason) => console.log('😞 Disconnected:', reason)}
        onError={(error) => console.error('🚫 Socket error:', error)}
      >
        {/* Rectangle Feature Provider */}
        <RectangleProvider>
          {/* Main Rectangle Feature */}
          <RectangleFeature
            showStats={true}
            showGrid={false}
            snapToGrid={false}
          />
        </RectangleProvider>
      </SocketProvider>
    </div>
  );
};

export default App;
