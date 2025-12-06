import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { createContainerTexture, createMetalTexture, createDeckTexture, createRustyMetalTexture } from '../utils/textures';
import dockerLogo from '../assets/docker.png';
import kubernetesLogo from '../assets/Kubernetes-Logo.jpg';

// Container component with detailed textures
function Container({ position, color, label = "CARGO" }) {
  const containerTexture = useMemo(() => createContainerTexture(color), [color]);
  const dockerTexture = useTexture(dockerLogo);
  
  return (
    <group position={position}>
      {/* Main container body */}
      <mesh>
        <boxGeometry args={[4, 2.5, 8]} />
        <meshStandardMaterial map={containerTexture} flatShading />
      </mesh>
      
      {/* Docker logo on right side */}
      <mesh position={[2.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3, 1.5]} />
        <meshStandardMaterial map={dockerTexture} transparent alphaTest={0.5} />
      </mesh>
      
      {/* Docker logo on left side */}
      <mesh position={[-2.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3, 1.5]} />
        <meshStandardMaterial map={dockerTexture} transparent alphaTest={0.5} />
      </mesh>
      
      {/* Container doors detail */}
      <group position={[0, 0, 4]}>
        <mesh position={[-0.5, 0, 0.05]}>
          <boxGeometry args={[1.8, 2.3, 0.1]} />
          <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.8)} flatShading />
        </mesh>
        <mesh position={[0.5, 0, 0.05]}>
          <boxGeometry args={[1.8, 2.3, 0.1]} />
          <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.8)} flatShading />
        </mesh>
        {/* Door handles */}
        <mesh position={[-0.2, 0, 0.15]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#666666" flatShading />
        </mesh>
        <mesh position={[0.2, 0, 0.15]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#666666" flatShading />
        </mesh>
        {/* Lock mechanism */}
        <mesh position={[0, 0, 0.2]}>
          <boxGeometry args={[0.3, 0.3, 0.15]} />
          <meshStandardMaterial color="#ffaa00" flatShading />
        </mesh>
      </group>
      
      {/* Corner reinforcements */}
      {[[-2, -1.25, -4], [-2, -1.25, 4], [-2, 1.25, -4], [-2, 1.25, 4],
        [2, -1.25, -4], [2, -1.25, 4], [2, 1.25, -4], [2, 1.25, 4]].map((pos, i) => (
        <mesh key={`corner-${i}`} position={pos}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#444444" flatShading />
        </mesh>
      ))}
      
      {/* Hazard stripes on corners */}
      {[[-2.05, 0, -4], [2.05, 0, -4], [-2.05, 0, 4], [2.05, 0, 4]].map((pos, i) => (
        <group key={`hazard-${i}`} position={pos}>
          {[...Array(5)].map((_, j) => (
            <mesh key={`stripe-${j}`} position={[0, -1 + j * 0.5, 0]}>
              <boxGeometry args={[0.05, 0.2, 0.05]} />
              <meshStandardMaterial color={j % 2 === 0 ? "#ffff00" : "#000000"} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function CargoShip({ position = [0, 0, -30] }) {
  const shipRef = useRef();
  const k8sTexture = useTexture(kubernetesLogo);
  
  // Create textures
  const metalTexture1 = useMemo(() => createMetalTexture('#4a5260'), []);
  const metalTexture2 = useMemo(() => createMetalTexture('#5a6270'), []);
  const metalTexture3 = useMemo(() => createMetalTexture('#6a7380'), []);
  const metalTexture4 = useMemo(() => createMetalTexture('#7d8491'), []);
  const metalTexture5 = useMemo(() => createMetalTexture('#8a909d'), []);
  const metalTexture6 = useMemo(() => createMetalTexture('#9aa0ad'), []);
  const metalTexture7 = useMemo(() => createMetalTexture('#a5abb8'), []);
  const metalTexture8 = useMemo(() => createMetalTexture('#b0b6c3'), []);
  const deckTexture = useMemo(() => createDeckTexture(), []);
  const rustyTexture = useMemo(() => createRustyMetalTexture('#3a4250'), []);
  const whiteTexture = useMemo(() => createMetalTexture('#e8e8e8'), []);
  const yellowTexture = useMemo(() => createMetalTexture('#ffaa00'), []);
  const redTexture = useMemo(() => createMetalTexture('#d62828'), []);
  const orangeTexture = useMemo(() => createMetalTexture('#ff8c00'), []);
  const glassTexture = useMemo(() => createMetalTexture('#2c5f7d'), []);
  
  return (
    <group ref={shipRef} position={position}>
      {/* BOW (FRONT) - Realistic V-shaped bow with fine detail */}
      {/* Very pointed bow tip */}
      {[...Array(20)].map((_, i) => {
        const z = -28 + i * 0.5;
        const width = 0.5 + i * 0.8;
        const height = 0.6;
        return (
          <mesh key={`bow-tip-${i}`} position={[0, -4.5, z]}>
            <boxGeometry args={[width, height, 0.5]} />
            <meshStandardMaterial map={metalTexture1} flatShading />
          </mesh>
        );
      })}
      
      {/* Lower bow - building up gradually */}
      {[...Array(20)].map((_, i) => {
        const z = -28 + i * 0.5;
        const width = 1 + i * 0.9;
        return (
          <mesh key={`bow-lower-${i}`} position={[0, -3.8, z]}>
            <boxGeometry args={[width, 0.6, 0.5]} />
            <meshStandardMaterial map={metalTexture2} flatShading />
          </mesh>
        );
      })}
      
      {/* Mid-lower bow */}
      {[...Array(20)].map((_, i) => {
        const z = -28 + i * 0.5;
        const width = 2 + i * 1.0;
        return (
          <mesh key={`bow-midlow-${i}`} position={[0, -3.2, z]}>
            <boxGeometry args={[width, 0.6, 0.5]} />
            <meshStandardMaterial map={metalTexture3} flatShading />
          </mesh>
        );
      })}
      
      {/* Mid bow */}
      {[...Array(20)].map((_, i) => {
        const z = -28 + i * 0.5;
        const width = 3 + i * 1.1;
        return (
          <mesh key={`bow-mid-${i}`} position={[0, -2.6, z]}>
            <boxGeometry args={[width, 0.6, 0.5]} />
            <meshStandardMaterial map={metalTexture4} flatShading />
          </mesh>
        );
      })}
      
      {/* Upper mid bow */}
      {[...Array(20)].map((_, i) => {
        const z = -28 + i * 0.5;
        const width = 4 + i * 1.2;
        return (
          <mesh key={`bow-upper-${i}`} position={[0, -2.0, z]}>
            <boxGeometry args={[width, 0.6, 0.5]} />
            <meshStandardMaterial map={metalTexture5} flatShading />
          </mesh>
        );
      })}
      
      {/* Top bow - freeboard */}
      {[...Array(20)].map((_, i) => {
        const z = -28 + i * 0.5;
        const width = 5 + i * 1.3;
        return (
          <mesh key={`bow-top-${i}`} position={[0, -1.4, z]}>
            <boxGeometry args={[width, 0.6, 0.5]} />
            <meshStandardMaterial map={metalTexture6} flatShading />
          </mesh>
        );
      })}
      
      {/* Bow deck */}
      {[...Array(18)].map((_, i) => {
        const z = -27 + i * 0.5;
        const width = 6 + i * 1.3;
        return (
          <mesh key={`bow-deck-${i}`} position={[0, -0.8, z]}>
            <boxGeometry args={[width, 0.4, 0.5]} />
            <meshStandardMaterial map={deckTexture} flatShading />
          </mesh>
        );
      })}
      
      {/* Bow bulb underwater (bulbous bow) */}
      {[...Array(10)].map((_, i) => {
        const z = -29 + i * 0.4;
        const width = 2 - i * 0.15;
        return (
          <mesh key={`bulb-${i}`} position={[0, -5.2, z]}>
            <boxGeometry args={[width, 0.8, 0.4]} />
            <meshStandardMaterial map={rustyTexture} flatShading />
          </mesh>
        );
      })}
      
      {/* MAIN HULL - Middle section with realistic layering */}
      {/* Keel - bottom most part */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`keel-${i}`} position={[0, -5.0, -17 + i * 0.7]}>
          <boxGeometry args={[10, 0.5, 0.7]} />
          <meshStandardMaterial color="#3a4250" flatShading />
        </mesh>
      ))}
      
      {/* Lower hull bilge */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`bilge-${i}`} position={[0, -4.5, -17 + i * 0.7]}>
          <boxGeometry args={[14, 0.5, 0.7]} />
          <meshStandardMaterial color="#4a5260" flatShading />
        </mesh>
      ))}
      
      {/* Lower hull 1 */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`hull-low1-${i}`} position={[0, -4.0, -17 + i * 0.7]}>
          <boxGeometry args={[17, 0.5, 0.7]} />
          <meshStandardMaterial color="#5a6270" flatShading />
        </mesh>
      ))}
      
      {/* Lower hull 2 */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`hull-low2-${i}`} position={[0, -3.5, -17 + i * 0.7]}>
          <boxGeometry args={[19, 0.5, 0.7]} />
          <meshStandardMaterial color="#6a7380" flatShading />
        </mesh>
      ))}
      
      {/* Mid hull 1 */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`hull-mid1-${i}`} position={[0, -3.0, -17 + i * 0.7]}>
          <boxGeometry args={[20, 0.5, 0.7]} />
          <meshStandardMaterial color="#7d8491" flatShading />
        </mesh>
      ))}
      
      {/* Mid hull 2 */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`hull-mid2-${i}`} position={[0, -2.5, -17 + i * 0.7]}>
          <boxGeometry args={[20.5, 0.5, 0.7]} />
          <meshStandardMaterial color="#8a909d" flatShading />
        </mesh>
      ))}
      
      {/* Upper hull 1 */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`hull-up1-${i}`} position={[0, -2.0, -17 + i * 0.7]}>
          <boxGeometry args={[21, 0.5, 0.7]} />
          <meshStandardMaterial color="#9aa0ad" flatShading />
        </mesh>
      ))}
      
      {/* Upper hull 2 - freeboard */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`hull-up2-${i}`} position={[0, -1.5, -17 + i * 0.7]}>
          <boxGeometry args={[21, 0.5, 0.7]} />
          <meshStandardMaterial color="#a5abb8" flatShading />
        </mesh>
      ))}
      
      {/* Top hull - gunwale */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`gunwale-${i}`} position={[0, -1.0, -17 + i * 0.7]}>
          <boxGeometry args={[21, 0.5, 0.7]} />
          <meshStandardMaterial color="#b0b6c3" flatShading />
        </mesh>
      ))}
      
      {/* Main deck */}
      {[...Array(50)].map((_, i) => (
        <mesh key={`deck-${i}`} position={[0, -0.5, -17 + i * 0.7]}>
          <boxGeometry args={[20, 0.4, 0.7]} />
          <meshStandardMaterial color="#3a4250" flatShading />
        </mesh>
      ))}
      
      {/* Deck details - planks */}
      {[...Array(45)].map((_, i) => (
        <mesh key={`plank-${i}`} position={[-9 + (i % 15) * 1.3, -0.35, -16 + Math.floor(i / 15) * 12]}>
          <boxGeometry args={[1.2, 0.05, 11]} />
          <meshStandardMaterial color="#2a3240" flatShading />
        </mesh>
      ))}
      
      {/* Hull plating lines (vertical welding seams) */}
      {[...Array(35)].map((_, i) => (
        <mesh key={`weld-left-${i}`} position={[-10.6, -3, -17 + i * 1]}>
          <boxGeometry args={[0.08, 4, 0.9]} />
          <meshStandardMaterial color="#444444" flatShading />
        </mesh>
      ))}
      {[...Array(35)].map((_, i) => (
        <mesh key={`weld-right-${i}`} position={[10.6, -3, -17 + i * 1]}>
          <boxGeometry args={[0.08, 4, 0.9]} />
          <meshStandardMaterial color="#444444" flatShading />
        </mesh>
      ))}
      
      {/* Horizontal hull strakes */}
      {[...Array(6)].map((_, level) => (
        [...Array(30)].map((_, i) => (
          <mesh key={`strake-${level}-${i}`} position={[0, -4.5 + level * 0.6, -17 + i * 1.2]}>
            <boxGeometry args={[20, 0.06, 1.1]} />
            <meshStandardMaterial color="#333333" flatShading />
          </mesh>
        ))
      ))}
      
      {/* STERN (BACK) - Realistic tapered stern */}
      {/* Stern bottom - gradual taper */}
      {[...Array(25)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 10 - i * 0.35;
        return (
          <mesh key={`stern-keel-${i}`} position={[0, -5.0, z]}>
            <boxGeometry args={[Math.max(width, 2), 0.5, 0.5]} />
            <meshStandardMaterial color="#3a4250" flatShading />
          </mesh>
        );
      })}
      
      {/* Stern bilge */}
      {[...Array(25)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 14 - i * 0.5;
        return (
          <mesh key={`stern-bilge-${i}`} position={[0, -4.5, z]}>
            <boxGeometry args={[Math.max(width, 3), 0.5, 0.5]} />
            <meshStandardMaterial color="#4a5260" flatShading />
          </mesh>
        );
      })}
      
      {/* Stern lower */}
      {[...Array(25)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 19 - i * 0.7;
        return (
          <mesh key={`stern-low-${i}`} position={[0, -4.0, z]}>
            <boxGeometry args={[Math.max(width, 4), 0.5, 0.5]} />
            <meshStandardMaterial color="#5a6270" flatShading />
          </mesh>
        );
      })}
      
      {/* Stern mid-lower */}
      {[...Array(25)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 20 - i * 0.75;
        return (
          <mesh key={`stern-midlow-${i}`} position={[0, -3.5, z]}>
            <boxGeometry args={[Math.max(width, 5), 0.5, 0.5]} />
            <meshStandardMaterial color="#6a7380" flatShading />
          </mesh>
        );
      })}
      
      {/* Stern mid */}
      {[...Array(25)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 20.5 - i * 0.78;
        return (
          <mesh key={`stern-mid-${i}`} position={[0, -3.0, z]}>
            <boxGeometry args={[Math.max(width, 6), 0.5, 0.5]} />
            <meshStandardMaterial color="#7d8491" flatShading />
          </mesh>
        );
      })}
      
      {/* Stern mid-upper */}
      {[...Array(25)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 21 - i * 0.8;
        return (
          <mesh key={`stern-midup-${i}`} position={[0, -2.5, z]}>
            <boxGeometry args={[Math.max(width, 7), 0.5, 0.5]} />
            <meshStandardMaterial color="#8a909d" flatShading />
          </mesh>
        );
      })}
      
      {/* Stern upper */}
      {[...Array(25)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 21 - i * 0.82;
        return (
          <mesh key={`stern-up-${i}`} position={[0, -2.0, z]}>
            <boxGeometry args={[Math.max(width, 8), 0.5, 0.5]} />
            <meshStandardMaterial color="#9aa0ad" flatShading />
          </mesh>
        );
      })}
      
      {/* Stern top */}
      {[...Array(25)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 21 - i * 0.83;
        return (
          <mesh key={`stern-top-${i}`} position={[0, -1.5, z]}>
            <boxGeometry args={[Math.max(width, 9), 0.5, 0.5]} />
            <meshStandardMaterial color="#a5abb8" flatShading />
          </mesh>
        );
      })}
      
      {/* Stern deck */}
      {[...Array(23)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 20 - i * 0.8;
        return (
          <mesh key={`stern-deck-${i}`} position={[0, -1.0, z]}>
            <boxGeometry args={[Math.max(width, 10), 0.5, 0.5]} />
            <meshStandardMaterial color="#b0b6c3" flatShading />
          </mesh>
        );
      })}
      
      {/* Stern deck top */}
      {[...Array(22)].map((_, i) => {
        const z = 18 + i * 0.5;
        const width = 19 - i * 0.8;
        return (
          <mesh key={`stern-deck-top-${i}`} position={[0, -0.5, z]}>
            <boxGeometry args={[Math.max(width, 9), 0.4, 0.5]} />
            <meshStandardMaterial color="#3a4250" flatShading />
          </mesh>
        );
      })}
      
      {/* Rudder and propeller area */}
      <mesh position={[0, -4, 29]}>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#5a6270" flatShading />
      </mesh>
      
      {/* SUPERSTRUCTURE/BRIDGE - Large white command tower like in photo */}
      <group position={[0, -0.5, 16]}>
        {/* Main white superstructure tower - multiple levels */}
        {/* Base level - 10x3x12 = width x height x depth */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[10, 3, 12]} />
          <meshStandardMaterial map={whiteTexture} flatShading />
        </mesh>
        
        {/* Second level - 9x3x11 */}
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[9, 3, 11]} />
          <meshStandardMaterial map={whiteTexture} flatShading />
        </mesh>
        
        {/* Third level - 8x3x10 */}
        <mesh position={[0, 7.5, 0]}>
          <boxGeometry args={[8, 3, 10]} />
          <meshStandardMaterial map={whiteTexture} flatShading />
        </mesh>
        
        {/* Bridge deck - top level with windows - 7x3x6 */}
        <mesh position={[0, 10.5, 2]}>
          <boxGeometry args={[7, 3, 6]} />
          <meshStandardMaterial map={whiteTexture} flatShading />
        </mesh>
        
        {/* Bridge wings - extended platforms on sides */}
        <mesh position={[-4.5, 10.5, 2]}>
          <boxGeometry args={[2, 0.5, 6]} />
          <meshStandardMaterial map={whiteTexture} flatShading />
        </mesh>
        <mesh position={[4.5, 10.5, 2]}>
          <boxGeometry args={[2, 0.5, 6]} />
          <meshStandardMaterial map={whiteTexture} flatShading />
        </mesh>
        
        {/* Bridge windows - front facing, on each level */}
        {/* Level 1 - Base level windows */}
        <group position={[0, 1.5, 6.1]}>
          {[...Array(6)].map((_, i) => (
            <mesh key={`window-l1-${i}`} position={[-2.5 + i * 1, 0, 0]}>
              <boxGeometry args={[0.7, 1.2, 0.15]} />
              <meshStandardMaterial map={glassTexture} flatShading />
            </mesh>
          ))}
        </group>
        
        {/* Level 2 windows */}
        <group position={[0, 4.5, 5.6]}>
          {[...Array(5)].map((_, i) => (
            <mesh key={`window-l2-${i}`} position={[-2 + i * 1, 0, 0]}>
              <boxGeometry args={[0.7, 1.2, 0.15]} />
              <meshStandardMaterial map={glassTexture} flatShading />
            </mesh>
          ))}
        </group>
        
        {/* Level 3 windows */}
        <group position={[0, 7.5, 5.1]}>
          {[...Array(5)].map((_, i) => (
            <mesh key={`window-l3-${i}`} position={[-2 + i * 1, 0, 0]}>
              <boxGeometry args={[0.7, 1.2, 0.15]} />
              <meshStandardMaterial map={glassTexture} flatShading />
            </mesh>
          ))}
        </group>
        
        {/* Bridge deck windows (top level) */}
        <group position={[0, 10.5, 5.1]}>
          {[...Array(4)].map((_, i) => (
            <mesh key={`window-bridge-${i}`} position={[-1.5 + i * 1, 0, 0]}>
              <boxGeometry args={[0.7, 1.5, 0.15]} />
              <meshStandardMaterial map={glassTexture} flatShading />
            </mesh>
          ))}
        </group>
        
        {/* Side windows - left side */}
        <group position={[-5.1, 4.5, 0]}>
          {[...Array(4)].map((_, i) => (
            <mesh key={`side-window-left-${i}`} position={[0, 0, -4 + i * 2.5]}>
              <boxGeometry args={[0.15, 1, 0.8]} />
              <meshStandardMaterial map={glassTexture} flatShading />
            </mesh>
          ))}
        </group>
        
        {/* Side windows - right side */}
        <group position={[5.1, 4.5, 0]}>
          {[...Array(4)].map((_, i) => (
            <mesh key={`side-window-right-${i}`} position={[0, 0, -4 + i * 2.5]}>
              <boxGeometry args={[0.15, 1, 0.8]} />
              <meshStandardMaterial map={glassTexture} flatShading />
            </mesh>
          ))}
        </group>
        
        {/* Mast and communication equipment - on top of bridge */}
        <mesh position={[0, 13.5, 2]}>
          <cylinderGeometry args={[0.25, 0.25, 3, 8]} />
          <meshStandardMaterial color="#cccccc" flatShading />
        </mesh>
        
        {/* Radar dishes - attached to mast */}
        <mesh position={[-1.5, 14.5, 2]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[1.2, 1.2, 0.2, 16]} />
          <meshStandardMaterial color="#888888" flatShading />
        </mesh>
        <mesh position={[1.5, 15, 2]}>
          <boxGeometry args={[1.5, 0.2, 2.5]} />
          <meshStandardMaterial color="#999999" flatShading />
        </mesh>
        
        {/* Navigation lights - on bridge wings */}
        <mesh position={[-5.5, 11, 5]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} flatShading />
        </mesh>
        <mesh position={[5.5, 11, 5]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} flatShading />
        </mesh>
        
        {/* Chimney/Funnel - behind bridge, orange/red */}
        <group position={[-3, 8, -3]}>
          {/* Main funnel body */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.7, 7, 12]} />
            <meshStandardMaterial map={orangeTexture} flatShading />
          </mesh>
          {/* Funnel cap */}
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[1.7, 1.5, 0.8, 12]} />
            <meshStandardMaterial color="#ff6600" flatShading />
          </mesh>
          {/* Company logo stripe - middle section */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[1.55, 1.65, 1.5, 12]} />
            <meshStandardMaterial color="#ffffff" flatShading />
          </mesh>
          {/* Exhaust pipes */}
          <mesh position={[0, 4.8, 0]}>
            <cylinderGeometry args={[1.2, 1.3, 0.3, 12]} />
            <meshStandardMaterial color="#333333" flatShading />
          </mesh>
        </group>
        
        {/* Ventilation units on roof - properly positioned on top level */}
        {[...Array(5)].map((_, i) => (
          <mesh key={`vent-${i}`} position={[-2 + i * 1, 12.3, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.6, 8]} />
            <meshStandardMaterial color="#bbbbbb" flatShading />
          </mesh>
        ))}
        
        {/* Antennas and communication equipment */}
        <mesh position={[3, 12.5, 3]}>
          <cylinderGeometry args={[0.1, 0.1, 2, 6]} />
          <meshStandardMaterial color="#888888" flatShading />
        </mesh>
        <mesh position={[-3, 12.5, 3]}>
          <cylinderGeometry args={[0.1, 0.1, 2.5, 6]} />
          <meshStandardMaterial color="#888888" flatShading />
        </mesh>
      </group>
      
      {/* KUBERNETES FLAG MAST - On opposite side of deck, visible from boat */}
      <group position={[-8, -0.5, 10]}>
        {/* Mast base - firmly on deck */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.7, 0.9, 0.6, 8]} />
          <meshStandardMaterial map={metalTexture2} flatShading />
        </mesh>
        
        {/* Mast pole - tall metal pole starting from base */}
        <mesh position={[0, 10, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 19, 8]} />
          <meshStandardMaterial map={metalTexture3} flatShading />
        </mesh>
        
        {/* Horizontal flag pole extending sideways from mast */}
        <mesh position={[3.5, 17, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 7, 8]} />
          <meshStandardMaterial map={metalTexture4} flatShading />
        </mesh>
        
        {/* KUBERNETES FLAG - Large, hanging from horizontal pole */}
        <mesh position={[4, 14.5, 0]}>
          <planeGeometry args={[7, 5]} />
          <meshStandardMaterial map={k8sTexture} transparent alphaTest={0.5} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Mast top cap - at the very top */}
        <mesh position={[0, 19.8, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#326ce5" flatShading />
        </mesh>
        
        {/* Support cables from mast to deck for stability */}
        <mesh position={[-1.5, 9, -1.5]} rotation={[0.3, 0, 0.2]}>
          <cylinderGeometry args={[0.04, 0.04, 10, 6]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[1.5, 9, -1.5]} rotation={[0.3, 0, -0.2]}>
          <cylinderGeometry args={[0.04, 0.04, 10, 6]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[-1.5, 9, 1.5]} rotation={[-0.3, 0, 0.2]}>
          <cylinderGeometry args={[0.04, 0.04, 10, 6]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[1.5, 9, 1.5]} rotation={[-0.3, 0, -0.2]}>
          <cylinderGeometry args={[0.04, 0.04, 10, 6]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
      </group>
      
      {/* MULTIPLE DETAILED CONTAINERS - Front section (near bow) */}
      <group position={[3.5, 1.5, -14]}>
        <Container position={[0, 0, 0]} color="#d62828" label="SHIP" />
        <Container position={[0, 2.6, 0]} color="#c41e1e" label="CODE" />
        <Container position={[0, 5.2, 0]} color="#b01a1a" label="DOCK" />
        <Container position={[0, 7.8, 0]} color="#9e1515" label="NODE" />
        <Container position={[0, 10.4, 0]} color="#8a1010" label="PULL" />
      </group>
      
      <group position={[-3.5, 1.5, -15]}>
        <Container position={[0, 0, 0]} color="#7209b7" label="TECH" />
        <Container position={[0, 2.6, 0]} color="#5a049e" label="BETA" />
        <Container position={[0, 5.2, 0]} color="#480486" label="TEST" />
        <Container position={[0, 7.8, 0]} color="#36006e" label="CICD" />
      </group>
      
      {/* Middle-front section */}
      <group position={[3.5, 1.5, -4]}>
        <Container position={[0, 0, 0]} color="#003049" label="KUBE" />
        <Container position={[0, 2.6, 0]} color="#00253a" label="HELM" />
        <Container position={[0, 5.2, 0]} color="#001a2b" label="PODS" />
        <Container position={[0, 7.8, 0]} color="#00101c" label="YAML" />
        <Container position={[0, 10.4, 0]} color="#000810" label="CONF" />
      </group>
      
      <group position={[-3.5, 1.5, -4]}>
        <Container position={[0, 0, 0]} color="#2a9d8f" label="DEVS" />
        <Container position={[0, 2.6, 0]} color="#238276" label="APPS" />
        <Container position={[0, 5.2, 0]} color="#1c6b61" label="SERV" />
        <Container position={[0, 7.8, 0]} color="#15564c" label="REST" />
      </group>
      
      {/* Center section */}
      <group position={[3.5, 1.5, 6]}>
        <Container position={[0, 0, 0]} color="#f77f00" label="DATA" />
        <Container position={[0, 2.6, 0]} color="#dc6900" label="PACK" />
        <Container position={[0, 5.2, 0]} color="#c45500" label="LOAD" />
        <Container position={[0, 7.8, 0]} color="#ac4300" label="JSON" />
        <Container position={[0, 10.4, 0]} color="#943100" label="APIS" />
      </group>
      
      <group position={[-3.5, 1.5, 6]}>
        <Container position={[0, 0, 0]} color="#e63946" label="PROD" />
        <Container position={[0, 2.6, 0]} color="#d62839" label="LIVE" />
        <Container position={[0, 5.2, 0]} color="#c6172d" label="SHIP" />
        <Container position={[0, 7.8, 0]} color="#b60620" label="CERT" />
      </group>
      
      
      {/* Container cranes - positioned on deck between container stacks */}
      <group position={[0, 1.5, -9]}>
        {/* Crane base/pillar - 1x10x1, center at y=5, so bottom at y=0 */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial map={yellowTexture} flatShading />
        </mesh>
        {/* Horizontal crane arm extending forward */}
        <mesh position={[0, 10, 5]}>
          <boxGeometry args={[0.5, 0.5, 10]} />
          <meshStandardMaterial map={yellowTexture} flatShading />
        </mesh>
        {/* Crane hook cable */}
        <mesh position={[0, 7, 8]}>
          <boxGeometry args={[0.15, 6, 0.15]} />
          <meshStandardMaterial color="#333333" flatShading />
        </mesh>
        {/* Hook mechanism */}
        <mesh position={[0, 3.5, 8]}>
          <boxGeometry args={[0.5, 0.3, 0.5]} />
          <meshStandardMaterial map={yellowTexture} flatShading />
        </mesh>
      </group>
      
      {/* Second crane - rear position */}
      <group position={[0, 1.5, 7]}>
        {/* Crane base */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[1, 10, 1]} />
          <meshStandardMaterial map={yellowTexture} flatShading />
        </mesh>
        {/* Horizontal arm extending backward */}
        <mesh position={[0, 10, -5]}>
          <boxGeometry args={[0.5, 0.5, 10]} />
          <meshStandardMaterial map={yellowTexture} flatShading />
        </mesh>
        {/* Cable */}
        <mesh position={[0, 7, -8]}>
          <boxGeometry args={[0.15, 6, 0.15]} />
          <meshStandardMaterial color="#333333" flatShading />
        </mesh>
        {/* Hook */}
        <mesh position={[0, 3.5, -8]}>
          <boxGeometry args={[0.5, 0.3, 0.5]} />
          <meshStandardMaterial map={yellowTexture} flatShading />
        </mesh>
      </group>
      
      {/* Small auxiliary chimney - on deck, lateral position */}
      <group position={[-8, -0.5, -12]}>
        {/* Chimney body - cylinderGeometry center is at position, height 6 means -3 to +3 */}
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.8, 1, 6, 8]} />
          <meshStandardMaterial map={redTexture} flatShading />
        </mesh>
        {/* Decorative bands */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.3, 8]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.3, 8]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        {/* Top cap */}
        <mesh position={[0, 6.3, 0]}>
          <cylinderGeometry args={[1.1, 0.9, 0.5, 8]} />
          <meshStandardMaterial color="#222222" flatShading />
        </mesh>
      </group>
    </group>
  );
}

export default CargoShip;
