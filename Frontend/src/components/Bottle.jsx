import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Bottle({ startPosition, endPosition, onComplete, projectName }) {
  const bottleRef = useRef();
  const glowRef = useRef();
  const trailRef = useRef();
  const particlesRef = useRef();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('throwing'); // 'throwing', 'floating', 'arrived'

  // Create trail particles
  const trailPositions = useMemo(() => {
    const positions = new Float32Array(50 * 3);
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (!bottleRef.current) return;

    if (phase === 'throwing') {
      // Throwing arc animation - FASTER and MORE DRAMATIC
      const newProgress = Math.min(progress + delta * 0.8, 1);
      setProgress(newProgress);

      // Higher parabolic arc
      const t = newProgress;
      const height = Math.sin(t * Math.PI) * 8; // Increased arc height

      const currentPos = new THREE.Vector3(
        startPosition[0] + (endPosition[0] - startPosition[0]) * t * 0.3,
        startPosition[1] + height,
        startPosition[2] + (endPosition[2] - startPosition[2]) * t * 0.3
      );

      bottleRef.current.position.copy(currentPos);
      bottleRef.current.rotation.z = t * Math.PI * 4; // More spinning
      bottleRef.current.rotation.x = t * Math.PI * 2;

      // Glow effect - brighter during flight
      if (glowRef.current) {
        glowRef.current.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.5);
      }

      // Update trail
      if (trailRef.current) {
        const positions = trailRef.current.geometry.attributes.position.array;
        for (let i = positions.length - 3; i >= 3; i -= 3) {
          positions[i] = positions[i - 3];
          positions[i + 1] = positions[i - 2];
          positions[i + 2] = positions[i - 1];
        }
        positions[0] = currentPos.x;
        positions[1] = currentPos.y;
        positions[2] = currentPos.z;
        trailRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (newProgress >= 1) {
        setPhase('floating');
        setProgress(0);
      }
    } else if (phase === 'floating') {
      // Floating to cargo ship - FASTER
      const newProgress = Math.min(progress + delta * 0.4, 1);
      setProgress(newProgress);

      const t = newProgress;
      const currentPos = new THREE.Vector3(
        startPosition[0] + (endPosition[0] - startPosition[0]) * (0.3 + t * 0.7),
        0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2, // More bobbing
        startPosition[2] + (endPosition[2] - startPosition[2]) * (0.3 + t * 0.7)
      );

      bottleRef.current.position.copy(currentPos);
      bottleRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.3;

      // Glow pulsing
      if (glowRef.current) {
        glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.3);
      }

      // Update trail
      if (trailRef.current) {
        const positions = trailRef.current.geometry.attributes.position.array;
        for (let i = positions.length - 3; i >= 3; i -= 3) {
          positions[i] = positions[i - 3];
          positions[i + 1] = positions[i - 2];
          positions[i + 2] = positions[i - 1];
        }
        positions[0] = currentPos.x;
        positions[1] = currentPos.y;
        positions[2] = currentPos.z;
        trailRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (newProgress >= 1) {
        setPhase('arrived');
        if (onComplete) onComplete();
      }
    } else if (phase === 'arrived') {
      // Bobbing at destination
      bottleRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      bottleRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.2;

      // Fade glow
      if (glowRef.current) {
        glowRef.current.scale.setScalar(Math.max(0, glowRef.current.scale.x - delta * 0.5));
      }
    }
  });

  return (
    <group ref={bottleRef} position={startPosition}>
      {/* Glowing aura around bottle */}
      <mesh ref={glowRef} scale={1.5}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Particle trail */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={trailPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#00ffff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Spotlight on bottle */}
      <pointLight
        intensity={2}
        distance={5}
        color="#00ffff"
        position={[0, 1, 0]}
      />

      {/* Bottle body - with glass texture detail */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.2, 1, 12]} />
        <meshStandardMaterial 
          color="#88ddbb" 
          transparent 
          opacity={0.7} 
          flatShading
          emissive="#446655"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Glass shine/highlight */}
      <mesh position={[0.12, 0.2, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.3]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.4} 
          flatShading 
        />
      </mesh>
      
      {/* Bottom of bottle */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.15, 12]} />
        <meshStandardMaterial 
          color="#77ccaa" 
          transparent 
          opacity={0.8} 
          flatShading 
        />
      </mesh>
      
      {/* Bottle neck */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.4, 12]} />
        <meshStandardMaterial 
          color="#88ddbb" 
          transparent 
          opacity={0.7} 
          flatShading 
        />
      </mesh>
      
      {/* Cork with texture */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.2, 12]} />
        <meshStandardMaterial color="#d2691e" flatShading />
      </mesh>
      
      {/* Cork top */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.13, 0.11, 0.05, 12]} />
        <meshStandardMaterial color="#cd853f" flatShading />
      </mesh>
      
      {/* Cork texture lines */}
      {[...Array(6)].map((_, i) => (
        <mesh key={`cork-line-${i}`} position={[0, 0.85 + i * 0.03, 0]}>
          <torusGeometry args={[0.11, 0.01, 8, 12]} />
          <meshStandardMaterial color="#a0522d" flatShading />
        </mesh>
      ))}
      
      {/* Paper scroll inside - rolled */}
      <group position={[0, 0, 0]} rotation={[0, 0, 0.2]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.7, 12]} />
          <meshStandardMaterial color="#fffacd" flatShading />
        </mesh>
        
        {/* Paper text lines (pixelated) */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`text-${i}`} position={[0.095, -0.25 + i * 0.08, 0]}>
            <boxGeometry args={[0.01, 0.05, 0.12]} />
            <meshStandardMaterial color="#2c1810" flatShading />
          </mesh>
        ))}
        
        {/* Rolled paper edges */}
        <mesh position={[0, 0.4, 0]}>
          <torusGeometry args={[0.09, 0.02, 8, 12]} />
          <meshStandardMaterial color="#f5e6d3" flatShading />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <torusGeometry args={[0.09, 0.02, 8, 12]} />
          <meshStandardMaterial color="#f5e6d3" flatShading />
        </mesh>
      </group>
      
      {/* Wax seal on paper */}
      <group position={[0, 0.25, 0]} rotation={[0, 0, 0.2]}>
        <mesh position={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 12]} />
          <meshStandardMaterial color="#8b0000" flatShading />
        </mesh>
        {/* Seal imprint */}
        <mesh position={[0.105, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 6]} />
          <meshStandardMaterial color="#660000" flatShading />
        </mesh>
      </group>
      
      {/* String/twine around bottle neck */}
      {[...Array(4)].map((_, i) => (
        <mesh key={`twine-${i}`} position={[0, 0.55 + i * 0.04, 0]}>
          <torusGeometry args={[0.12, 0.015, 8, 12]} />
          <meshStandardMaterial color="#8b7355" flatShading />
        </mesh>
      ))}
      
      {/* Label on bottle */}
      <group position={[0, 0.1, 0.18]}>
        <mesh>
          <planeGeometry args={[0.25, 0.35]} />
          <meshStandardMaterial color="#f4e4c1" flatShading />
        </mesh>
        {/* Label border */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.23, 0.33]} />
          <meshStandardMaterial color="#d4a574" flatShading />
        </mesh>
        {/* Label text (pixelated) */}
        <mesh position={[0, 0.08, 0.002]}>
          <boxGeometry args={[0.15, 0.04, 0.01]} />
          <meshStandardMaterial color="#000000" flatShading />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <boxGeometry args={[0.18, 0.03, 0.01]} />
          <meshStandardMaterial color="#000000" flatShading />
        </mesh>
        <mesh position={[0, -0.08, 0.002]}>
          <boxGeometry args={[0.12, 0.03, 0.01]} />
          <meshStandardMaterial color="#000000" flatShading />
        </mesh>
      </group>
      
      {/* Water droplets on outside */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.19;
        return (
          <mesh 
            key={`drop-${i}`} 
            position={[
              Math.cos(angle) * radius, 
              -0.2 + Math.random() * 0.6, 
              Math.sin(angle) * radius
            ]}
          >
            <boxGeometry args={[0.02, 0.04, 0.02]} />
            <meshStandardMaterial 
              color="#aaddcc" 
              transparent 
              opacity={0.6} 
              flatShading 
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default Bottle;
