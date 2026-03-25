import React, { useEffect, useCallback } from 'react';
import { Canvas, useThree, invalidate } from '@react-three/fiber';
import { throttleRender } from '@/utils/fpsThrottle';
import { CAMERA_CONFIG } from '@/utils/constants';

function FullscreenResizeHandler() {
  const { gl, invalidate: inv } = useThree();

  useEffect(() => {
    const handleResize = () => {
      // Force the canvas to re-measure and R3F to recalculate
      setTimeout(() => {
        gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
        inv();
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('fullscreenchange', handleResize);
      document.removeEventListener('webkitfullscreenchange', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [gl, inv]);

  return null;
}

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
      <FullscreenResizeHandler />
      {children}
    </Canvas>
  );
};

export default Scene;
