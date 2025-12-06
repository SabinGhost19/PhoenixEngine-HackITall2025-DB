import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import TeletextScreen from './TeletextScreen';
import { SAMPLE_PAGES } from '../utils/teletextRenderer';

const ControlPanel = forwardRef(({ bottles, position = [-20, 5, -10], onPageChange }, ref) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(-1);
  const [viewingDetails, setViewingDetails] = useState(false);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    nextPage: () => {
      if (viewingDetails) return; // Don't change pages in detail view
      setAutoRotate(false);
      setCurrentPage((prev) => (prev + 1) % 3);
    },
    prevPage: () => {
      if (viewingDetails) return;
      setAutoRotate(false);
      setCurrentPage((prev) => (prev - 1 + 3) % 3);
    },
    nextItem: () => {
      if (currentPage === 0 && !viewingDetails && bottles.length > 0) {
        setSelectedProjectIndex((prev) => Math.min(prev + 1, bottles.length - 1));
      }
    },
    prevItem: () => {
      if (currentPage === 0 && !viewingDetails) {
        setSelectedProjectIndex((prev) => Math.max(prev - 1, -1));
      }
    },
    selectItem: () => {
      if (currentPage === 0 && selectedProjectIndex >= 0 && !viewingDetails) {
        setViewingDetails(true);
      }
    },
    backToList: () => {
      if (viewingDetails) {
        setViewingDetails(false);
        return true;
      }
      return false;
    },
    enableAutoRotate: () => setAutoRotate(true),
    disableAutoRotate: () => setAutoRotate(false),
  }));

  // Update pages based on data
  useEffect(() => {
    const stats = {
      boats: 5,
      bottles: bottles.length,
      queue: bottles.filter((b) => b.status === 'pending').length || bottles.length,
    };

    let updatedPages;

    if (viewingDetails && selectedProjectIndex >= 0 && bottles[selectedProjectIndex]) {
      // Show detail view on page 0
      updatedPages = [
        SAMPLE_PAGES.projectDetails(bottles[selectedProjectIndex]),
        SAMPLE_PAGES.projects(bottles),
        SAMPLE_PAGES.network(stats),
      ];
    } else {
      // Normal pages
      updatedPages = [
        SAMPLE_PAGES.dashboard(bottles, selectedProjectIndex),
        SAMPLE_PAGES.projects(bottles),
        SAMPLE_PAGES.network(stats),
      ];
    }

    setPages(updatedPages);
  }, [bottles, selectedProjectIndex, viewingDetails]);

  // Auto-rotate pages every 10 seconds (only when enabled)
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % 3);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Notify parent of page changes
  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

  return (
    <group position={position}>
      {/* Main control panel frame */}
      <mesh position={[0, 0, -0.5]}>
        <boxGeometry args={[20, 15, 1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Panel border lights */}
      {[...Array(4)].map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const radius = 8;
        return (
          <mesh
            key={`light-${i}`}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.6, 0.1]}
          >
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color={i === currentPage ? '#00ff00' : '#003300'}
              emissive={i === currentPage ? '#00ff00' : '#001100'}
              emissiveIntensity={i === currentPage ? 2 : 0.5}
            />
          </mesh>
        );
      })}

      {/* Main screen */}
      <TeletextScreen
        position={[0, 0, 0.1]}
        rotation={[0, 0, 0]}
        scale={[1, 1, 1]}
        pageData={pages[currentPage]}
        screenId="main"
      />

      {/* Side info screens (smaller) */}
      <TeletextScreen
        position={[-11, 5, 0.1]}
        rotation={[0, 0.1, 0]}
        scale={[0.4, 0.4, 1]}
        pageData={pages[(currentPage + 1) % 3]}
        screenId="side1"
      />

      <TeletextScreen
        position={[11, 5, 0.1]}
        rotation={[0, -0.1, 0]}
        scale={[0.4, 0.4, 1]}
        pageData={pages[(currentPage + 2) % 3]}
        screenId="side2"
      />

      {/* Control lights strip */}
      <mesh position={[0, -7, 0.1]}>
        <boxGeometry args={[18, 0.5, 0.2]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Label */}
      <mesh position={[0, -8, 0.1]}>
        <boxGeometry args={[10, 0.8, 0.1]} />
        <meshStandardMaterial color="#ffff00" />
      </mesh>

      {/* Support structure */}
      <mesh position={[0, -10, -0.5]}>
        <cylinderGeometry args={[0.5, 0.8, 5, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
});

ControlPanel.displayName = 'ControlPanel';

export default ControlPanel;
