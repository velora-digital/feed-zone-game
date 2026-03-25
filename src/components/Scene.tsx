import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { throttleRender } from '@/utils/fpsThrottle';
import { CAMERA_CONFIG } from '@/utils/constants';

function ResizeHandler() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const handleResize = () => {
      const width = gl.domElement.clientWidth;
      const height = gl.domElement.clientHeight;
      if (camera.type === 'OrthographicCamera') {
        const cam = camera as any;
        cam.left = width / -2;
        cam.right = width / 2;
        cam.top = height / 2;
        cam.bottom = height / -2;
        cam.updateProjectionMatrix();
      }
      gl.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    // Also handle fullscreen changes
    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      document.removeEventListener('webkitfullscreenchange', handleResize);
    };
  }, [camera, gl]);

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
      resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
    >
      <color attach="background" args={['#87CEEB']} />
      <ambientLight intensity={0.4} />
      <ResizeHandler />
      {children}
    </Canvas>
  );
};

export default Scene;
