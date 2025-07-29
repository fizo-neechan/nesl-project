import React from 'react';
import './App.css';
import CollaborativeCanvas from './features/canvas/CollaborativeCanvas';

const App: React.FC = () => {
  return (
    <div className="App">
      <CollaborativeCanvas />
    </div>
  );
};

export default App;
