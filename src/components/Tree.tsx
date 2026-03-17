import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { tileSize } from '@/utils/constants';
import { TreeProps } from '@/types';

const buntingColors = [0xe53935, 0xfdd835, 0x1e88e5, 0x43a047, 0xff9800, 0xffffff, 0xf48fb1];

// Roadside obstacle — barrier, spectators, or tree+bush, all with bunting
export default function Tree({ tileIndex, height }: TreeProps) {
  if (height <= 30) {
    return <BarrierWithBunting tileIndex={tileIndex} />;
  }
  if (height <= 50) {
    return <SpectatorGroup tileIndex={tileIndex} />;
  }
  return <TreeWithBunting tileIndex={tileIndex} height={height} />;
}

function BarrierWithBunting({ tileIndex }: { tileIndex: number }) {
  return (
    <group position-x={tileIndex * tileSize}>
      {/* Barrier post left */}
      <mesh position={[-tileSize * 0.3, 0, 8]} rotation-x={Math.PI / 2} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 16, 6]} />
        <meshLambertMaterial color={0x9e9e9e} flatShading />
      </mesh>
      {/* Barrier post right */}
      <mesh position={[tileSize * 0.3, 0, 8]} rotation-x={Math.PI / 2} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 16, 6]} />
        <meshLambertMaterial color={0x9e9e9e} flatShading />
      </mesh>
      {/* Barrier rail */}
      <mesh position={[0, 0, 14]} castShadow receiveShadow>
        <boxGeometry args={[tileSize * 0.8, 2, 2.5]} />
        <meshLambertMaterial color={0xf44336} flatShading />
      </mesh>
      {/* White stripe */}
      <mesh position={[0, 1.1, 14]} castShadow receiveShadow>
        <boxGeometry args={[tileSize * 0.8, 0.3, 1.2]} />
        <meshLambertMaterial color={0xffffff} flatShading />
      </mesh>
      {/* Bunting string */}
      <mesh position={[0, 0, 17.5]} castShadow receiveShadow>
        <boxGeometry args={[tileSize * 0.75, 0.3, 0.3]} />
        <meshLambertMaterial color={0xeeeeee} flatShading />
      </mesh>
      {[-3, -1.5, 0, 1.5, 3].map((xOff, i) => (
        <group key={i} position={[xOff * 3, 0.2, 16]}>
          <mesh castShadow receiveShadow rotation-x={0.1}>
            <coneGeometry args={[1.8, 3, 3]} />
            <meshLambertMaterial color={buntingColors[(i + Math.abs(tileIndex)) % buntingColors.length]} flatShading />
          </mesh>
        </group>
      ))}
      {/* Small bush next to barrier */}
      <mesh position={[tileSize * 0.35, 0, 6]} castShadow receiveShadow>
        <sphereGeometry args={[5, 8, 8]} />
        <meshLambertMaterial color={0x4caf50} flatShading />
      </mesh>
    </group>
  );
}

function WavingFlag({ color, phaseOffset = 0 }: { color: number; phaseOffset?: number }) {
  const flagRef = useRef(null);
  useFrame(({ clock }) => {
    if (!flagRef.current) return;
    // Wave back and forth
    const angle = Math.sin(clock.elapsedTime * 3 + phaseOffset) * 0.4;
    flagRef.current.rotation.z = angle;
    flagRef.current.rotation.x = Math.sin(clock.elapsedTime * 2.5 + phaseOffset) * 0.15;
  });
  return (
    <group ref={flagRef} position={[5, 0, 20]}>
      {/* Stick */}
      <mesh rotation-x={Math.PI / 2} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 10, 4]} />
        <meshLambertMaterial color={0x8d6e63} flatShading />
      </mesh>
      {/* Flag cloth */}
      <mesh position={[0, 0, 6]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.3, 3]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

function SpectatorGroup({ tileIndex }: { tileIndex: number }) {
  const shirtColors = [0xe53935, 0xfdd835, 0x43a047, 0xff9800, 0x7b1fa2, 0x1e88e5, 0xf48fb1];
  const skinTones = [0xffcc99, 0xdeb887, 0xc68642, 0xf5cba7];
  const fans = [
    { x: -6, shirt: shirtColors[Math.abs(tileIndex * 3) % shirtColors.length], skin: skinTones[Math.abs(tileIndex) % skinTones.length], hasFlag: true },
    { x: 0, shirt: shirtColors[Math.abs(tileIndex * 3 + 1) % shirtColors.length], skin: skinTones[Math.abs(tileIndex + 1) % skinTones.length], hasFlag: false },
    { x: 6, shirt: shirtColors[Math.abs(tileIndex * 3 + 2) % shirtColors.length], skin: skinTones[Math.abs(tileIndex + 2) % skinTones.length], hasFlag: true },
  ];

  // Animate the flag-holding arm
  const armRef0 = useRef(null);
  const armRef2 = useRef(null);
  useFrame(({ clock }) => {
    const wave = Math.sin(clock.elapsedTime * 3) * 0.3;
    const wave2 = Math.sin(clock.elapsedTime * 3 + 2) * 0.3;
    if (armRef0.current) armRef0.current.rotation.z = wave;
    if (armRef2.current) armRef2.current.rotation.z = wave2;
  });

  const armRefs = [armRef0, null, armRef2];

  return (
    <group position-x={tileIndex * tileSize}>
      {fans.map((fan, i) => (
        <group key={i} position={[fan.x, 0, 0]}>
          {/* Legs */}
          <mesh position={[-1.2, 0, 2.5]} castShadow receiveShadow>
            <boxGeometry args={[2, 2, 5]} />
            <meshLambertMaterial color={0x37474f} flatShading />
          </mesh>
          <mesh position={[1.2, 0, 2.5]} castShadow receiveShadow>
            <boxGeometry args={[2, 2, 5]} />
            <meshLambertMaterial color={0x37474f} flatShading />
          </mesh>
          {/* Body */}
          <mesh position={[0, 0, 10]} castShadow receiveShadow>
            <boxGeometry args={[6, 4, 9]} />
            <meshLambertMaterial color={fan.shirt} flatShading />
          </mesh>
          {/* Left arm (static) */}
          <mesh position={[-4.5, 0, 12]} castShadow receiveShadow>
            <boxGeometry args={[2, 2, 7]} />
            <meshLambertMaterial color={fan.skin} flatShading />
          </mesh>
          {/* Right arm (waves if holding flag) */}
          <group ref={fan.hasFlag ? armRefs[i] : undefined} position={[4.5, 0, fan.hasFlag ? 16 : 12]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2, 2, 7]} />
              <meshLambertMaterial color={fan.skin} flatShading />
            </mesh>
          </group>
          {/* Head */}
          <mesh position={[0, 0, 17.5]} castShadow receiveShadow>
            <boxGeometry args={[4.5, 4.5, 5]} />
            <meshLambertMaterial color={fan.skin} flatShading />
          </mesh>
          {/* Hair / hat */}
          <mesh position={[0, 0, 20.5]} castShadow receiveShadow>
            <boxGeometry args={[5, 5, 1.5]} />
            <meshLambertMaterial color={i % 2 === 0 ? 0x5d4037 : fan.shirt} flatShading />
          </mesh>
          {/* Waving flag */}
          {fan.hasFlag && <WavingFlag color={fan.shirt} phaseOffset={i * 2} />}
        </group>
      ))}
      {/* Bunting draped between spectator positions */}
      <mesh position={[0, 0, 22]} castShadow receiveShadow>
        <boxGeometry args={[18, 0.25, 0.25]} />
        <meshLambertMaterial color={0xeeeeee} flatShading />
      </mesh>
      {[-2, -1, 0, 1, 2].map((xOff, i) => (
        <mesh key={`sb-${i}`} position={[xOff * 3.5, 0.2, 20.5]}>
          <coneGeometry args={[1.3, 2.4, 3]} />
          <meshLambertMaterial color={buntingColors[(i + Math.abs(tileIndex)) % buntingColors.length]} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function TreeWithBunting({ tileIndex, height }: { tileIndex: number; height: number }) {
  // Classic roadside tree with bunting wrapped around / strung between
  return (
    <group position-x={tileIndex * tileSize}>
      {/* Trunk */}
      <mesh position-z={height / 2} castShadow receiveShadow rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[4, 4, height, 8]} />
        <meshLambertMaterial color={0x8d5524} flatShading />
      </mesh>
      {/* Foliage layers */}
      <mesh position-z={height + 14} castShadow receiveShadow>
        <sphereGeometry args={[18, 16, 16]} />
        <meshLambertMaterial color={0x6cbf2c} flatShading />
      </mesh>
      <mesh position={[0, 0, height + 28]} castShadow receiveShadow>
        <sphereGeometry args={[13, 16, 16]} />
        <meshLambertMaterial color={0x5ea726} flatShading />
      </mesh>
      <mesh position={[-6, 0, height + 20]} castShadow receiveShadow>
        <sphereGeometry args={[10, 16, 16]} />
        <meshLambertMaterial color={0x4e8c1a} flatShading />
      </mesh>
      {/* Bunting wrapped around trunk */}
      <mesh position={[0, 0, height * 0.7]} castShadow receiveShadow>
        <boxGeometry args={[12, 0.25, 0.25]} />
        <meshLambertMaterial color={0xeeeeee} flatShading />
      </mesh>
      {[-1, 0, 1].map((xOff, i) => (
        <mesh key={`tb-${i}`} position={[xOff * 4, 0.2, height * 0.7 - 1.5]}>
          <coneGeometry args={[1.5, 2.5, 3]} />
          <meshLambertMaterial color={buntingColors[(i + Math.abs(tileIndex)) % buntingColors.length]} flatShading />
        </mesh>
      ))}
      {/* Small bush at base */}
      <mesh position={[5, 0, 4]} castShadow receiveShadow>
        <sphereGeometry args={[4, 8, 8]} />
        <meshLambertMaterial color={0x388e3c} flatShading />
      </mesh>
      <mesh position={[-4, 3, 3]} castShadow receiveShadow>
        <sphereGeometry args={[3, 8, 8]} />
        <meshLambertMaterial color={0x43a047} flatShading />
      </mesh>
    </group>
  );
}
