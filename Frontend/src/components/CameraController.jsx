import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function CameraController({ targetPosition, targetLookAt, isActive, onComplete }) {
  const { camera } = useThree();
  const startPosition = useRef(new THREE.Vector3());
  const startLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const progress = useRef(0);
  const animating = useRef(false);

  useEffect(() => {
    if (isActive && !animating.current) {
      // Store starting position
      startPosition.current.copy(camera.position);

      // Calculate current lookAt (approximate based on camera direction)
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      startLookAt.current.copy(camera.position).add(direction.multiplyScalar(10));

      // Start animation
      animating.current = true;
      progress.current = 0;
    } else if (!isActive && animating.current) {
      // Reset animation
      animating.current = true;
      progress.current = 0;
    }
  }, [isActive, camera]);

  useFrame((state, delta) => {
    if (!animating.current) return;

    // Animate progress
    progress.current += delta * 1.5; // Speed of animation

    if (progress.current >= 1) {
      progress.current = 1;
      animating.current = false;
      if (onComplete) onComplete();
    }

    // Smooth easing function (ease-in-out)
    const t = progress.current;
    const eased = t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t;

    // Interpolate camera position
    const target = isActive ? targetPosition : startPosition.current;
    const start = isActive ? startPosition.current : targetPosition;

    camera.position.lerpVectors(start, target, eased);

    // Interpolate lookAt
    const targetLook = isActive ? targetLookAt : startLookAt.current;
    const startLook = isActive ? startLookAt.current : targetLookAt;

    const lookAt = new THREE.Vector3().lerpVectors(startLook, targetLook, eased);
    camera.lookAt(lookAt);
  });

  return null;
}

export default CameraController;
