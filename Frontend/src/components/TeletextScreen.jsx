import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  renderTeletextPage,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../utils/teletextRenderer';

function TeletextScreen({ position, rotation, scale, pageData, screenId }) {
  const meshRef = useRef();
  const canvasRef = useRef();
  const textureRef = useRef();

  // Create canvas and texture
  useEffect(() => {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvasRef.current = canvas;

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    textureRef.current = texture;

    return () => {
      texture.dispose();
    };
  }, []);

  // Update canvas when pageData changes
  useEffect(() => {
    if (!canvasRef.current || !pageData) return;

    const ctx = canvasRef.current.getContext('2d');
    renderTeletextPage(ctx, pageData);

    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  }, [pageData]);

  // Subtle CRT flicker effect
  useFrame((state) => {
    if (meshRef.current) {
      const flicker = 0.95 + Math.sin(state.clock.elapsedTime * 60) * 0.02;
      meshRef.current.material.opacity = flicker;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[16, 12]} />
      <meshBasicMaterial
        map={textureRef.current}
        transparent
        opacity={0.95}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default TeletextScreen;
