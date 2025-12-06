import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, PointerLockControls } from '@react-three/drei';
import Ocean from '../components/Ocean';
import Boat from '../components/Boat';
import Bottle from '../components/Bottle';
import CargoShip from '../components/CargoShip';
import UploadUI from '../components/UploadUI';
import * as THREE from 'three';

// Camera controller pentru first-person look around
function FirstPersonCamera() {
  const controlsRef = useRef();
  
  return (
    <PointerLockControls
      ref={controlsRef}
      selector="#lock-instructions"
      maxPolarAngle={Math.PI / 1.8}
      minPolarAngle={Math.PI / 3}
    />
  );
}

function ClientView({ onSendBottle }) {
  const [bottles, setBottles] = useState([]);
  
  const handleUpload = (projectData) => {
    // Create bottle and animate it
    const newBottle = {
      id: Date.now(),
      projectName: projectData.name,
      startPosition: [0, 1, -3], // From boat
      endPosition: [0, 2, -60], // To cargo ship
    };
    
    setBottles([...bottles, newBottle]);
    
    // Notify parent after animation completes
    setTimeout(() => {
      onSendBottle(projectData);
    }, 5000);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Instructions for pointer lock */}
      <div id="lock-instructions" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '20px',
        fontFamily: 'Courier New',
        fontSize: '16px',
        border: '3px solid #fff',
        zIndex: 1000,
        pointerEvents: 'none',
        display: 'none'
      }}>
        CLICK TO LOOK AROUND
      </div>
      
      <Canvas
        camera={{
          position: [-2, 4, 5],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        onCreated={({ camera }) => {
          camera.lookAt(15, 3, -60);
        }}
        gl={{ 
          antialias: false,
          powerPreference: "high-performance"
        }}
      >
        <FirstPersonCamera />
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
        />
        <directionalLight 
          position={[-10, 5, -5]} 
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
        
        {/* Player's boat - first person view */}
        <Boat position={[0, 0, 2]} />
        
        {/* Cargo ship - diagonal view, further away */}
        <CargoShip position={[15, 2, -60]} scale={[2, 2, 2]} rotation={[0, -0.3, 0]} />
        
        {/* Bottles being sent */}
        {bottles.map((bottle) => (
          <Bottle
            key={bottle.id}
            startPosition={bottle.startPosition}
            endPosition={bottle.endPosition}
            projectName={bottle.projectName}
          />
        ))}
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#87ceeb', 30, 200]} />
      </Canvas>
      
      {/* Upload UI Overlay */}
      <UploadUI onUpload={handleUpload} />
    </div>
  );
}

export default ClientView;
