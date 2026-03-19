import React, { useRef, useState } from 'react';
import { tileSize } from '@/utils/constants';
import { useFrame } from '@react-three/fiber';
import { playerState } from '@/logic/playerLogic';
import { visibleTilesDistance } from '@/utils/constants';
import { CornProps } from '@/types';
import * as THREE from 'three';

// Energy gel / spare bidon collectible — replaces corn
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
  useFrame(() => {
    if (!isVisible) return;
    if (!collected || !ref.current || doneRef.current) return;
    const duration = 0.6;
    const elapsed = (performance.now() - start) / 1000;
    if (elapsed >= duration) {
      if (!doneRef.current) {
        doneRef.current = true;
        setDone(prev => {
          if (!prev) return true;
          return prev;
        });
      }
      return;
    }
    const scale = 1 + 2 * Math.sin((elapsed / duration) * Math.PI);
    ref.current.scale.set(scale, scale, scale);
    ref.current.position.z = 30 + 10 * Math.sin((elapsed / duration) * Math.PI);
  });
  if (done) return null;

  // Alternate between energy gel and bidon based on tile index
  const isGel = tileIndex % 2 === 0;

  return (
    <group ref={ref} position={[tileIndex * tileSize, 0, 6]}>
      {isGel ? <EnergyGel /> : <SpareBidon />}
    </group>
  );
}

function EnergyGel() {
  return (
    <group rotation-x={0.3}>
      {/* Gel packet body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 1.5, 5]} />
        <meshLambertMaterial color={0xff6f00} flatShading />
      </mesh>
      {/* Gel top / tear tab */}
      <mesh position={[0, 0, 3.2]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.5, 1]} />
        <meshLambertMaterial color={0xffcc02} flatShading />
      </mesh>
    </group>
  );
}

function SpareBidon() {
  return (
    <group>
      {/* Bidon bottle */}
      <mesh castShadow receiveShadow rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[1.8, 1.8, 5, 8]} />
        <meshLambertMaterial color={0x00e676} flatShading />
      </mesh>
      {/* Bidon cap / nozzle */}
      <mesh position={[0, 0, 3.2]} castShadow receiveShadow rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.7, 0.9, 1.5, 8]} />
        <meshLambertMaterial color={0xeeeeee} flatShading />
      </mesh>
    </group>
  );
}
