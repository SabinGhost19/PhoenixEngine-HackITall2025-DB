import { useState } from 'react';
import ClientView from './scenes/ClientView';
import AdminView from './scenes/AdminView';
import ViewToggle from './components/ViewToggle';
import RealisticCRT from './pages/RealisticCRT';
import { logoutUser } from './services/authService';
import './App.css';

function App() {
  const [view, setView] = useState('client'); // 'client' or 'admin'
  const [bottles, setBottles] = useState([]); // Queue of bottles sent by clients
  const [user, setUser] = useState(null); // Authenticated user data

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

  const handleLogin = (userData) => {
    setUser(userData);
    console.log('User logged in:', userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
    console.log('User registered:', userData);
  };

  const handleLogout = () => {
    logoutUser(); // Clear authentication token
    setUser(null);
  };

  // Show realistic CRT desktop for authentication
  if (!user) {
    return <RealisticCRT onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // Main application (authenticated)
  // Regular users can only see client view, admins can toggle between both
  const isAdmin = user?.role === 'admin';
  const currentView = isAdmin ? view : 'client';

  return (
    <div className="app">

      {/* Only show view toggle for admin users */}
      {isAdmin && (
        <ViewToggle currentView={currentView} onViewChange={setView} user={user} onLogout={handleLogout} />
      )}
      
      {/* Show logout button for regular users */}
      {!isAdmin && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px 20px',
          border: '2px solid #00ff00',
          fontFamily: 'Courier New',
          color: '#00ff00',
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <span>USER: {user.username}</span>
          <button
            onClick={handleLogout}
            style={{
              background: '#ff0000',
              color: '#fff',
              border: '2px solid #fff',
              padding: '5px 15px',
              fontFamily: 'Courier New',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            LOGOUT
          </button>
        </div>
      )}

      {currentView === 'client' ? (

        <ClientView onSendBottle={handleSendBottle} />
      ) : (
        <AdminView bottles={bottles} />
      )}
    </div>
  );
}

export default App;
