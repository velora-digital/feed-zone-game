import React from 'react';
import { Canvas } from '@react-three/fiber';
import { throttleRender } from '@/utils/fpsThrottle';
import { CAMERA_CONFIG } from '@/utils/constants';

/**
 * Scene wrapper component that provides the Three.js Canvas with
 * optimized rendering and lighting setup
 */
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
      {children}
    </Canvas>
  );
};

export default Scene;
