import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { oceanVertexShader, oceanFragmentShader } from '../shaders/oceanShader';

function Ocean() {
  const meshRef = useRef();
  
  const uniforms = useRef({
    uTime: { value: 0 },
    uWaveStrength: { value: 0.4 },
    uColorDeep: { value: new THREE.Color('#1e88e5') },
    uColorSurface: { value: new THREE.Color('#42a5f5') },
    uColorFoam: { value: new THREE.Color('#e3f2fd') }
  });

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.current.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <mesh 
        ref={meshRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
      >
        <planeGeometry args={[200, 200, 128, 128]} />
        <shaderMaterial
          vertexShader={oceanVertexShader}
          fragmentShader={oceanFragmentShader}
          uniforms={uniforms.current}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Add some floating debris for detail */}
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 20 + Math.random() * 30;
        return (
          <mesh 
            key={`debris-${i}`}
            position={[
              Math.cos(angle) * radius,
              -0.8 + Math.sin(Date.now() * 0.001 + i) * 0.1,
              Math.sin(angle) * radius
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <boxGeometry args={[0.3 + Math.random() * 0.5, 0.1, 0.3 + Math.random() * 0.5]} />
            <meshStandardMaterial color="#8b7355" flatShading />
          </mesh>
        );
      })}
    </>
  );
}

export default Ocean;
