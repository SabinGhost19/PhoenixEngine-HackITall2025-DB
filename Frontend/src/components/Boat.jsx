import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createWoodTexture } from '../utils/textures';

function Boat({ position = [0, 0, 0] }) {
  const boatRef = useRef();
  
  // Create textures
  const woodTexture = useMemo(() => createWoodTexture('#654321', '#8b4513'), []);
  const darkWoodTexture = useMemo(() => createWoodTexture('#4a3010', '#654321'), []);
  
  useFrame((state) => {
    if (boatRef.current) {
      // Boat rocking animation
      const time = state.clock.elapsedTime;
      boatRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      boatRef.current.rotation.x = Math.cos(time * 0.3) * 0.05;
      boatRef.current.position.y = position[1] + Math.sin(time * 0.8) * 0.2;
    }
  });

  return (
    <group ref={boatRef} position={position}>
      {/* Main hull with wooden planks */}
      <group>
        {/* Individual wooden planks for detailed look */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`plank-${i}`} position={[0, -0.2, -2.5 + i * 0.7]}>
            <boxGeometry args={[3, 0.15, 0.6]} />
            <meshStandardMaterial map={woodTexture} flatShading />
            <meshStandardMaterial color={i % 2 === 0 ? "#8b4513" : "#7a3c0f"} flatShading />
          </mesh>
        ))}
      </group>
      
      {/* Bottom keel */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[2.5, 0.3, 5.8]} />
        <meshStandardMaterial color="#654321" flatShading />
      </mesh>
      
      {/* Side panels with planks detail */}
      <group position={[-1.5, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 1, 6]} />
          <meshStandardMaterial color="#654321" flatShading />
        </mesh>
        {/* Nails/rivets on side */}
        {[...Array(6)].map((_, i) => (
          <mesh key={`nail-left-${i}`} position={[0.08, 0.3, -2.5 + i]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color="#3d3d3d" flatShading />
          </mesh>
        ))}
      </group>
      
      <group position={[1.5, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 1, 6]} />
          <meshStandardMaterial color="#654321" flatShading />
        </mesh>
        {/* Nails/rivets on side */}
        {[...Array(6)].map((_, i) => (
          <mesh key={`nail-right-${i}`} position={[-0.08, 0.3, -2.5 + i]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color="#3d3d3d" flatShading />
          </mesh>
        ))}
      </group>
      
      {/* Front bow with detailed planks */}
      <mesh position={[0, 0.3, -3]}>
        <boxGeometry args={[3, 0.9, 0.25]} />
        <meshStandardMaterial color="#654321" flatShading />
      </mesh>
      <mesh position={[0, 0.2, -3.1]}>
        <boxGeometry args={[2.5, 0.6, 0.15]} />
        <meshStandardMaterial color="#7a3c0f" flatShading />
      </mesh>
      
      {/* Back stern */}
      <mesh position={[0, 0.3, 3]}>
        <boxGeometry args={[3, 0.9, 0.25]} />
        <meshStandardMaterial color="#654321" flatShading />
      </mesh>
      
      {/* Cross beams (seats) */}
      <mesh position={[0, 0.5, 1.5]}>
        <boxGeometry args={[2.8, 0.2, 0.3]} />
        <meshStandardMaterial color="#8b4513" flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.8, 0.2, 0.3]} />
        <meshStandardMaterial color="#8b4513" flatShading />
      </mesh>
      <mesh position={[0, 0.5, -1.5]}>
        <boxGeometry args={[2.8, 0.2, 0.3]} />
        <meshStandardMaterial color="#8b4513" flatShading />
      </mesh>
      
      {/* Oars */}
      <group position={[-1.8, 0.6, 0.5]} rotation={[0, 0, -0.3]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.15, 0.15, 3]} />
          <meshStandardMaterial color="#d2691e" flatShading />
        </mesh>
        <mesh position={[0, 0, -1.6]}>
          <boxGeometry args={[0.4, 0.05, 0.6]} />
          <meshStandardMaterial color="#cd853f" flatShading />
        </mesh>
      </group>
      
      <group position={[1.8, 0.6, 0.5]} rotation={[0, 0, 0.3]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.15, 0.15, 3]} />
          <meshStandardMaterial color="#d2691e" flatShading />
        </mesh>
        <mesh position={[0, 0, -1.6]}>
          <boxGeometry args={[0.4, 0.05, 0.6]} />
          <meshStandardMaterial color="#cd853f" flatShading />
        </mesh>
      </group>
      
      {/* Rope coils */}
      {[...Array(3)].map((_, i) => (
        <mesh key={`rope-${i}`} position={[-0.8 + i * 0.8, 0.7, 2.2]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.05, 8, 12]} />
          <meshStandardMaterial color="#daa520" flatShading />
        </mesh>
      ))}
      
      {/* Small anchor */}
      <group position={[1.2, 0.4, 2.5]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#4a4a4a" flatShading />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.3, 0.08, 0.08]} />
          <meshStandardMaterial color="#4a4a4a" flatShading />
        </mesh>
      </group>
      
      {/* Water bucket */}
      <mesh position={[-1, 0.5, 2.3]}>
        <cylinderGeometry args={[0.15, 0.18, 0.25, 8]} />
        <meshStandardMaterial color="#8b7355" flatShading />
      </mesh>
      
      {/* Reinforcement ribs inside boat */}
      {[...Array(4)].map((_, i) => (
        <group key={`rib-${i}`} position={[0, 0, -2 + i * 1.3]}>
          <mesh position={[-1.2, 0, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.08, 0.6, 0.08]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          <mesh position={[1.2, 0, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.08, 0.6, 0.08]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default Boat;
