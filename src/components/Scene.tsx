import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { throttleRender } from '@/utils/fpsThrottle';
import { CAMERA_CONFIG } from '@/utils/constants';

const REFERENCE_HEIGHT = 380; // Design reference height in pixels

function ResponsiveZoom() {
  const { camera, size } = useThree();

  // Scale zoom so game looks the same at any viewport size
  const scale = size.height / REFERENCE_HEIGHT;
  camera.zoom = scale;
  camera.updateProjectionMatrix();

  return null;
}

const Scene = ({ children }) => {
  return (
    <Canvas
      orthographic={true}
      shadows={true}
      camera={CAMERA_CONFIG}
      frameloop="always"
      onCreated={throttleRender}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#87CEEB']} />
      <ambientLight intensity={0.4} />
      <ResponsiveZoom />
      {children}
    </Canvas>
  );
};

export default Scene;
