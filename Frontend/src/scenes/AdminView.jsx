import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import Ocean from '../components/Ocean';
import Boat from '../components/Boat';
import CargoShip from '../components/CargoShip';
import Bottle from '../components/Bottle';
import './AdminView.css';

function AdminView({ bottles }) {
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
        
        {/* Orbit controls for admin view */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.2}
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
      </div>
    </div>
  );
}

export default AdminView;
