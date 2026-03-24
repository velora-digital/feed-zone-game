import React, { useRef, useState } from 'react';
import { tileSize } from '@/utils/constants';
import { useFrame } from '@react-three/fiber';
import { playerState } from '@/logic/playerLogic';
import { visibleTilesDistance } from '@/utils/constants';
import { CornProps } from '@/types';
import * as THREE from 'three';

// Water bottle collectible — pickup to use as ammo for feeding riders
export default function Corn({
  tileIndex,
  collected = false,
  start,
  rowIndex,
}: CornProps) {
  const ref = useRef<THREE.Group>(null);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const isVisible =
    typeof rowIndex === 'number'
      ? Math.abs(rowIndex - playerState.currentRow) <= visibleTilesDistance
      : true;

  useFrame(({ clock }) => {
    if (!isVisible) return;
    if (!ref.current) return;

    if (collected) {
      // Collection animation — pop up and fade
      if (doneRef.current) return;
      const duration = 0.6;
      const elapsed = (performance.now() - start) / 1000;
      if (elapsed >= duration) {
        if (!doneRef.current) {
          doneRef.current = true;
          setDone(prev => (!prev ? true : prev));
        }
        return;
      }
      const scale = 1 + 2 * Math.sin((elapsed / duration) * Math.PI);
      ref.current.scale.set(scale, scale, scale);
      ref.current.position.z = 30 + 10 * Math.sin((elapsed / duration) * Math.PI);
    } else {
      // Idle pulse — gentle bob and glow to make it obvious this is a pickup
      const pulse = 1.0 + 0.15 * Math.sin(clock.elapsedTime * 3);
      ref.current.scale.set(pulse, pulse, pulse);
      ref.current.position.z = 8 + 2 * Math.sin(clock.elapsedTime * 2);
    }
  });

  if (done) return null;

  return (
    <group ref={ref} position={[tileIndex * tileSize, 0, 8]}>
      <WaterBottle />
    </group>
  );
}

function WaterBottle() {
  return (
    <group>
      {/* Bottle body — white/light grey, bigger than before */}
      <mesh castShadow receiveShadow rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[2.5, 2.5, 7, 8]} />
        <meshLambertMaterial color={0xf0f0f0} flatShading />
      </mesh>
      {/* Blue label band */}
      <mesh position={[0, 0, -0.5]} castShadow receiveShadow rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[2.6, 2.6, 2, 8]} />
        <meshLambertMaterial color={0x29b6f6} flatShading />
      </mesh>
      {/* Cap / nozzle — white */}
      <mesh position={[0, 0, 4.5]} castShadow receiveShadow rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[1.0, 1.2, 2, 8]} />
        <meshLambertMaterial color={0xffffff} flatShading />
      </mesh>
    </group>
  );
}
