import React, { useRef } from 'react';
import { useVehicleAnimation } from '@/animation/useVehicleAnimation';
import { useHitDetection } from '@/logic/collisionEffects';
import {
  tileSize,
  minTileIndex,
  maxTileIndex,
  visibleTilesDistance,
} from '@/utils/constants';
import { playerState } from '@/logic/playerLogic';
import { useFrame } from '@react-three/fiber';

// Cycling hazard obstacle — motorbike or peloton group
export default function Ball({
  rowIndex,
  ballIndex,
  direction,
  speed,
  color,
  total,
}) {
  const ref = useRef(null);
  const wrapLength = (maxTileIndex - minTileIndex + 4) * tileSize;
  const beginningOfRow = (minTileIndex - 2) * tileSize;
  const endOfRow = (maxTileIndex + 2) * tileSize;
  const offset = (ballIndex / total) * wrapLength;
  useVehicleAnimation(
    ref,
    direction,
    speed,
    offset,
    wrapLength,
    beginningOfRow,
    endOfRow
  );
  useHitDetection(ref, rowIndex);
  const isVisible =
    Math.abs(rowIndex - playerState.currentRow) <= visibleTilesDistance;

  const isMotorbike = color === 0xf44336 || color === 0xff9800;

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {isVisible && (
        isMotorbike ? <Motorbike color={color} /> : <PelotonGroup color={color} />
      )}
    </group>
  );
}

function CyclistOnBike({ jerseyColor, helmetColor = 0xeeeeee, offsetX = 0 }: {
  jerseyColor: number;
  helmetColor?: number;
  offsetX?: number;
}) {
  return (
    <group position={[offsetX, 0, 0]}>
      {/* ---- Bike ---- */}
      {/* Rear wheel */}
      <group position={[-5, 0, 3.5]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[3.5, 0.4, 6, 16]} />
          <meshLambertMaterial color={0x222222} flatShading />
        </mesh>
        {/* Hub */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.6, 6, 6]} />
          <meshLambertMaterial color={0x999999} flatShading />
        </mesh>
      </group>
      {/* Front wheel */}
      <group position={[5, 0, 3.5]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[3.5, 0.4, 6, 16]} />
          <meshLambertMaterial color={0x222222} flatShading />
        </mesh>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.6, 6, 6]} />
          <meshLambertMaterial color={0x999999} flatShading />
        </mesh>
      </group>
      {/* Frame - seat tube */}
      <mesh position={[-2, 0, 6]} rotation-z={0.15} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 6]} />
        <meshLambertMaterial color={0x444444} flatShading />
      </mesh>
      {/* Frame - top tube */}
      <mesh position={[0, 0, 8]} castShadow receiveShadow>
        <boxGeometry args={[8, 1, 1]} />
        <meshLambertMaterial color={0x444444} flatShading />
      </mesh>
      {/* Frame - down tube */}
      <mesh position={[1.5, 0, 5.5]} rotation-z={-0.3} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 7]} />
        <meshLambertMaterial color={0x444444} flatShading />
      </mesh>
      {/* Handlebars */}
      <mesh position={[5, 0, 9]} castShadow receiveShadow>
        <boxGeometry args={[2, 4, 0.8]} />
        <meshLambertMaterial color={0x333333} flatShading />
      </mesh>
      {/* Seat */}
      <mesh position={[-2.5, 0, 9.5]} castShadow receiveShadow>
        <boxGeometry args={[3, 2, 0.8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>

      {/* ---- Rider ---- */}
      {/* Torso (leaning forward) */}
      <mesh position={[1, 0, 13]} rotation-z={0.4} castShadow receiveShadow>
        <boxGeometry args={[7, 4, 5]} />
        <meshLambertMaterial color={jerseyColor} flatShading />
      </mesh>
      {/* Arms reaching to handlebars */}
      <mesh position={[4, 0, 12]} rotation-z={0.6} castShadow receiveShadow>
        <boxGeometry args={[4, 1.5, 1.5]} />
        <meshLambertMaterial color={jerseyColor} flatShading />
      </mesh>
      {/* Head */}
      <mesh position={[3.5, 0, 16.5]} castShadow receiveShadow>
        <sphereGeometry args={[2, 8, 8]} />
        <meshLambertMaterial color={0xffcc99} flatShading />
      </mesh>
      {/* Helmet */}
      <mesh position={[3.5, 0, 18.5]} castShadow receiveShadow>
        <sphereGeometry args={[2.3, 8, 8]} />
        <meshLambertMaterial color={helmetColor} flatShading />
      </mesh>
      {/* Helmet visor */}
      <mesh position={[3.5, 2, 17.5]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.5, 1]} />
        <meshLambertMaterial color={0x333333} flatShading />
      </mesh>
      {/* Legs on pedals */}
      <mesh position={[-3, 0, 8]} rotation-z={-0.5} castShadow receiveShadow>
        <boxGeometry args={[1.5, 2, 5]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      <mesh position={[-1, 0, 7]} rotation-z={0.3} castShadow receiveShadow>
        <boxGeometry args={[1.5, 2, 5]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      {/* Shoes */}
      <mesh position={[-4, 0, 5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2, 1]} />
        <meshLambertMaterial color={0xeeeeee} flatShading />
      </mesh>
      <mesh position={[0, 0, 4.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2, 1]} />
        <meshLambertMaterial color={0xeeeeee} flatShading />
      </mesh>
    </group>
  );
}

function Motorbike({ color }: { color: number }) {
  return (
    <group>
      {/* Motorbike chassis */}
      <mesh position={[0, 0, 5]} castShadow receiveShadow>
        <boxGeometry args={[tileSize * 0.55, tileSize * 0.2, 5]} />
        <meshLambertMaterial color={0x333333} flatShading />
      </mesh>
      {/* Engine block */}
      <mesh position={[0, 0, 3.5]} castShadow receiveShadow>
        <boxGeometry args={[6, 5, 3]} />
        <meshLambertMaterial color={0x555555} flatShading />
      </mesh>
      {/* Fairing / windscreen */}
      <mesh position={[8, 0, 10]} castShadow receiveShadow>
        <boxGeometry args={[3, 5, 6]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
      {/* Rider / camera operator body */}
      <mesh position={[2, 0, 11]} rotation-z={0.3} castShadow receiveShadow>
        <boxGeometry args={[6, 4, 6]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
      {/* Rider head + helmet */}
      <mesh position={[4, 0, 16]} castShadow receiveShadow>
        <sphereGeometry args={[2.8, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      {/* Helmet visor */}
      <mesh position={[4, 2.5, 15.5]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.5, 1.5]} />
        <meshLambertMaterial color={0x444444} flatShading />
      </mesh>

      {/* ---- TV Camera rig on back ---- */}
      {/* Camera platform / pillion seat extension */}
      <mesh position={[-4, 0, 12]} castShadow receiveShadow>
        <boxGeometry args={[6, 5, 2]} />
        <meshLambertMaterial color={0x424242} flatShading />
      </mesh>
      {/* Camera mast */}
      <mesh position={[-4, 0, 17]} rotation-x={Math.PI / 2} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 8, 6]} />
        <meshLambertMaterial color={0x616161} flatShading />
      </mesh>
      {/* Camera body (big boxy TV camera) */}
      <mesh position={[-4, 0, 22]} castShadow receiveShadow>
        <boxGeometry args={[5, 4, 4]} />
        <meshLambertMaterial color={0x212121} flatShading />
      </mesh>
      {/* Camera lens */}
      <mesh position={[-4, 2.5, 22]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 3, 8]} />
        <meshLambertMaterial color={0x111111} flatShading />
      </mesh>
      {/* Lens glass */}
      <mesh position={[-4, 4, 22]} castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.3, 0.3, 8]} />
        <meshLambertMaterial color={0x4fc3f7} flatShading />
      </mesh>
      {/* Red recording light */}
      <mesh position={[-2, 0, 24.5]} castShadow receiveShadow>
        <sphereGeometry args={[0.6, 6, 6]} />
        <meshLambertMaterial color={0xff1744} flatShading />
      </mesh>
      {/* "TV" label box on side */}
      <mesh position={[-4, -2.5, 22]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.3, 2]} />
        <meshLambertMaterial color={0xffffff} flatShading />
      </mesh>

      {/* Front wheel */}
      <group position={[tileSize * 0.22, 0, 3]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[3, 0.6, 6, 12]} />
          <meshLambertMaterial color={0x111111} flatShading />
        </mesh>
      </group>
      {/* Rear wheel */}
      <group position={[-tileSize * 0.22, 0, 3]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[3, 0.6, 6, 12]} />
          <meshLambertMaterial color={0x111111} flatShading />
        </mesh>
      </group>
    </group>
  );
}

function PelotonGroup({ color }: { color: number }) {
  const helmetColors = [0xeeeeee, 0xffeb3b, 0x90caf9];
  const jerseyColors = [color, (color + 0x222222) & 0xffffff, color];
  return (
    <group>
      <CyclistOnBike jerseyColor={jerseyColors[0]} helmetColor={helmetColors[0]} offsetX={-8} />
      <CyclistOnBike jerseyColor={jerseyColors[1]} helmetColor={helmetColors[1]} offsetX={4} />
      <CyclistOnBike jerseyColor={jerseyColors[2]} helmetColor={helmetColors[2]} offsetX={16} />
    </group>
  );
}
