import { useState } from 'react';
import ClientView from './scenes/ClientView';
import AdminView from './scenes/AdminView';
import ViewToggle from './components/ViewToggle';
import './App.css';

function App() {
  const [view, setView] = useState('client'); // 'client' or 'admin'
  const [bottles, setBottles] = useState([]); // Queue of bottles sent by clients

  const handleSendBottle = (projectData) => {
    const newBottle = {
      id: Date.now(),
      projectName: projectData.name,
      uploadId: projectData.uploadId,
      fileCount: projectData.fileCount,
      timestamp: new Date().toISOString(),
      position: [Math.random() * 10 - 5, 0, Math.random() * 10 - 5], // Random position on ocean
      status: 'pending', // pending, analyzing, complete
    };
    setBottles([...bottles, newBottle]);
  };

  return (
    <div className="app">
      <ViewToggle currentView={view} onViewChange={setView} />

      {view === 'client' ? (
        <ClientView onSendBottle={handleSendBottle} />
      ) : (
        <AdminView bottles={bottles} />
      )}
    </div>
  );
}

export default App;
