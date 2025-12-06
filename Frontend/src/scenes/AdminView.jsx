import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import Ocean from '../components/Ocean';
import Boat from '../components/Boat';
import CargoShip from '../components/CargoShip';
import Bottle from '../components/Bottle';
import ControlPanel from '../components/ControlPanel';
import TeletextPanelView from '../components/TeletextPanelView';
import CameraController from '../components/CameraController';
import { SAMPLE_PAGES } from '../utils/teletextRenderer';
import './AdminView.css';

function AdminView({ bottles }) {
  const [panelMode, setPanelMode] = useState(false);
  const [zoomingIn, setZoomingIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(-1);
  const [viewingDetails, setViewingDetails] = useState(false);
  const controlPanelRef = useRef();
  const orbitControlsRef = useRef();

  // Camera positions for zoom animation
  const commandRoomPosition = new THREE.Vector3(0, 3, 0); // Inside cargo ship
  const commandRoomLookAt = new THREE.Vector3(0, 3, -5);

  const handleEnterPanel = () => {
    // Start zoom animation
    setZoomingIn(true);

    // Disable orbit controls during transition
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
    }

    // After zoom animation completes, show panel
    setTimeout(() => {
      setZoomingIn(false);
      setPanelMode(true);
      setCurrentPage(0);
      setSelectedProjectIndex(-1);
      setViewingDetails(false);
    }, 2000); // 2 second transition
  };

  const handleExitPanel = () => {
    // Hide panel first
    setPanelMode(false);

    // Start zoom out animation
    setZoomingIn(true);

    // After zoom animation completes, reset everything
    setTimeout(() => {
      setZoomingIn(false);
      setCurrentPage(0);
      setSelectedProjectIndex(-1);
      setViewingDetails(false);

      // Re-enable orbit controls
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
      }
    }, 2000);
  };

  // Generate current page data
  const getCurrentPageData = () => {
    const stats = {
      boats: 5,
      bottles: bottles.length,
      queue: bottles.filter((b) => b.status === 'pending').length || bottles.length,
    };

    if (viewingDetails && selectedProjectIndex >= 0 && bottles[selectedProjectIndex]) {
      return SAMPLE_PAGES.projectDetails(bottles[selectedProjectIndex]);
    }

    switch (currentPage) {
      case 0:
        return SAMPLE_PAGES.dashboard(bottles, selectedProjectIndex);
      case 1:
        return SAMPLE_PAGES.projects(bottles);
      case 2:
        return SAMPLE_PAGES.network(stats);
      default:
        return SAMPLE_PAGES.dashboard(bottles, selectedProjectIndex);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          position: [0, 25, 20],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: false,
          powerPreference: "high-performance"
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1} 
          castShadow 
        />
        <directionalLight 
          position={[-10, 10, -10]} 
          intensity={0.3} 
        />
        
        {/* Sky */}
        <Sky
          distance={450000}
          sunPosition={[100, 20, 100]}
          inclination={0.6}
          azimuth={0.25}
        />
        
        {/* Ocean */}
        <Ocean />
        
        {/* Main cargo ship - admin's view */}
        <CargoShip position={[0, 0, 0]} />
        
        {/* Client boats in the distance */}
        <Boat position={[-15, 0, 25]} />
        <Boat position={[12, 0, 30]} />
        <Boat position={[-8, 0, 35]} />
        <Boat position={[18, 0, 28]} />
        <Boat position={[0, 0, 40]} />
        
        {/* Bottles on deck (received projects) */}
        {bottles.map((bottle, index) => (
          <Bottle
            key={bottle.id}
            startPosition={[
              -5 + (index % 4) * 2.5,
              3,
              -8 + Math.floor(index / 4) * 2.5
            ]}
            endPosition={[
              -5 + (index % 4) * 2.5,
              3,
              -8 + Math.floor(index / 4) * 2.5
            ]}
            projectName={bottle.projectName}
          />
        ))}

        {/* Camera zoom animation into command room */}
        {zoomingIn && (
          <CameraController
            targetPosition={commandRoomPosition}
            targetLookAt={commandRoomLookAt}
            isActive={true}
          />
        )}

        {/* Orbit controls for admin view */}
        <OrbitControls
          ref={orbitControlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.2}
          enabled={!zoomingIn}
        />
        
        {/* Fog */}
        <fog attach="fog" args={['#5fcde4', 30, 120]} />
      </Canvas>
      
      {/* Admin HUD */}
      <div className="admin-hud">
        <div className="hud-panel">
          <h2>🚢 CARGO SHIP CONTROL</h2>
          <div className="stat-row">
            <span className="stat-label">BOATS IN RANGE:</span>
            <span className="stat-value">5</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">BOTTLES RECEIVED:</span>
            <span className="stat-value">{bottles.length}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">STATUS:</span>
            <span className="stat-value status-active">OPERATIONAL</span>
          </div>
        </div>

        {bottles.length > 0 && (
          <div className="hud-panel project-list">
            <h3>📦 PROJECT QUEUE</h3>
            <div className="project-items">
              {bottles.map((bottle, index) => (
                <div key={bottle.id} className="project-item">
                  <span className="project-number">#{index + 1}</span>
                  <span className="project-name">{bottle.projectName}</span>
                  <span className="project-status">PENDING</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Control Panel Access Button */}
        {!zoomingIn && !panelMode && (
          <button
            className="panel-access-btn"
            onClick={handleEnterPanel}
            style={{
              position: 'fixed',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '15px 30px',
              fontSize: '18px',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
              color: '#000',
              border: '3px solid #00ff00',
              borderRadius: '0',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.3)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateX(-50%) scale(1.05)';
              e.target.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateX(-50%) scale(1)';
              e.target.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.3)';
            }}
          >
            📺 ACCESS CONTROL PANEL
          </button>
        )}

        {/* Zoom transition overlay */}
        {zoomingIn && !panelMode && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0)',
            animation: 'fadeToBlack 2s ease-in-out forwards',
            zIndex: 1500,
            pointerEvents: 'none',
          }}>
            <style>{`
              @keyframes fadeToBlack {
                0% { background: rgba(0, 0, 0, 0); }
                100% { background: rgba(0, 0, 0, 1); }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Fullscreen Teletext Panel View */}
      {panelMode && (
        <TeletextPanelView
          bottles={bottles}
          onExit={handleExitPanel}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          selectedProjectIndex={selectedProjectIndex}
          onSelectProject={setSelectedProjectIndex}
          viewingDetails={viewingDetails}
          onViewDetails={setViewingDetails}
          onBackToList={() => setViewingDetails(false)}
          pageData={getCurrentPageData()}
        />
      )}
    </div>
  );
}

export default AdminView;
