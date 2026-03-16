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

// Team colour palettes: [primary, secondary/band, accent]
const teamLiveries = [
  { primary: 0x1565c0, band: 0xffffff, accent: 0xfdd835 },  // blue/white/yellow
  { primary: 0xe53935, band: 0xffffff, accent: 0x212121 },  // red/white/black
  { primary: 0x212121, band: 0x00e676, accent: 0xffffff },  // black/green/white
  { primary: 0xffffff, band: 0x1565c0, accent: 0xe53935 },  // white/blue/red
  { primary: 0xf9a825, band: 0x212121, accent: 0xffffff },  // yellow/black/white
];

// Team car obstacle
export default function Log({ rowIndex, logIndex, direction, speed, total }) {
  const carRef = useRef(null);
  const wrapLength = (maxTileIndex - minTileIndex + 4) * tileSize;
  const beginningOfRow = (minTileIndex - 2) * tileSize;
  const endOfRow = (maxTileIndex + 2) * tileSize;
  const offset = (logIndex / total) * wrapLength;
  useVehicleAnimation(
    carRef,
    direction,
    speed,
    offset,
    wrapLength,
    beginningOfRow,
    endOfRow
  );
  useHitDetection(carRef, rowIndex);
  const isVisible =
    Math.abs(rowIndex - playerState.currentRow) <= visibleTilesDistance;

  const livery = teamLiveries[logIndex % teamLiveries.length];
  // Every 2nd vehicle in a lane is a caravan float
  const isCaravan = logIndex % 2 === 1;

  return (
    <group ref={carRef} position={[0, 0, 0]}>
      {isVisible && (isCaravan ? <CaravanFloat index={logIndex} /> : <TeamCar livery={livery} />)}
    </group>
  );
}

function TeamCar({ livery }: { livery: { primary: number; band: number; accent: number } }) {
  const w = tileSize * 0.85;  // car length
  const d = tileSize * 0.38;  // car width
  return (
    <group>
      {/* ---- Lower body ---- */}
      <mesh position={[0, 0, 4]} castShadow receiveShadow>
        <boxGeometry args={[w, d, 5]} />
        <meshLambertMaterial color={livery.primary} flatShading />
      </mesh>
      {/* Band stripe across the middle of body */}
      <mesh position={[0, d / 2 + 0.1, 4.5]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.95, 0.3, 2]} />
        <meshLambertMaterial color={livery.band} flatShading />
      </mesh>
      <mesh position={[0, -(d / 2 + 0.1), 4.5]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.95, 0.3, 2]} />
        <meshLambertMaterial color={livery.band} flatShading />
      </mesh>
      {/* Accent stripe (thinner, on top of band) */}
      <mesh position={[0, d / 2 + 0.15, 3.2]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.9, 0.2, 0.8]} />
        <meshLambertMaterial color={livery.accent} flatShading />
      </mesh>
      <mesh position={[0, -(d / 2 + 0.15), 3.2]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.9, 0.2, 0.8]} />
        <meshLambertMaterial color={livery.accent} flatShading />
      </mesh>

      {/* ---- Cabin / windscreen ---- */}
      <mesh position={[-2, 0, 9.5]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.45, d * 0.85, 5]} />
        <meshLambertMaterial color={0x90caf9} flatShading />
      </mesh>
      {/* Cabin pillars in team color */}
      <mesh position={[-2 - w * 0.2, 0, 9.5]} castShadow receiveShadow>
        <boxGeometry args={[1.5, d * 0.88, 5.2]} />
        <meshLambertMaterial color={livery.primary} flatShading />
      </mesh>
      <mesh position={[-2 + w * 0.2, 0, 9.5]} castShadow receiveShadow>
        <boxGeometry args={[1.5, d * 0.88, 5.2]} />
        <meshLambertMaterial color={livery.primary} flatShading />
      </mesh>

      {/* ---- Roof ---- */}
      <mesh position={[-2, 0, 12.2]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.5, d * 0.9, 1]} />
        <meshLambertMaterial color={livery.primary} flatShading />
      </mesh>

      {/* ---- Roof rack ---- */}
      {/* Rack rails */}
      <mesh position={[-2, d * 0.35, 13]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.55, 0.8, 0.8]} />
        <meshLambertMaterial color={0x616161} flatShading />
      </mesh>
      <mesh position={[-2, -d * 0.35, 13]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.55, 0.8, 0.8]} />
        <meshLambertMaterial color={0x616161} flatShading />
      </mesh>

      {/* ---- Bike on roof ---- */}
      <RoofBike x={-2} frameColor={livery.accent} />

      {/* ---- Headlights ---- */}
      <mesh position={[w * 0.42, d * 0.3, 5]} castShadow receiveShadow>
        <boxGeometry args={[1, 2.5, 1.5]} />
        <meshLambertMaterial color={0xfff9c4} flatShading />
      </mesh>
      <mesh position={[w * 0.42, -d * 0.3, 5]} castShadow receiveShadow>
        <boxGeometry args={[1, 2.5, 1.5]} />
        <meshLambertMaterial color={0xfff9c4} flatShading />
      </mesh>
      {/* Tail lights */}
      <mesh position={[-w * 0.42, d * 0.3, 5]} castShadow receiveShadow>
        <boxGeometry args={[1, 2.5, 1.5]} />
        <meshLambertMaterial color={0xd32f2f} flatShading />
      </mesh>
      <mesh position={[-w * 0.42, -d * 0.3, 5]} castShadow receiveShadow>
        <boxGeometry args={[1, 2.5, 1.5]} />
        <meshLambertMaterial color={0xd32f2f} flatShading />
      </mesh>

      {/* ---- Wheels ---- */}
      {/* Front */}
      <mesh position={[w * 0.32, d * 0.42, 2]} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      <mesh position={[w * 0.32, -d * 0.42, 2]} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      {/* Rear */}
      <mesh position={[-w * 0.32, d * 0.42, 2]} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      <mesh position={[-w * 0.32, -d * 0.42, 2]} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
    </group>
  );
}

function RoofBike({ x, frameColor }: { x: number; frameColor: number }) {
  // Big, clearly visible bike on the roof rack — scaled up 1.8x
  const s = 1.8;
  return (
    <group position={[x, 0, 13.8]} scale={[s, s, s]}>
      {/* Top tube */}
      <mesh position={[0, 0, 1.5]} castShadow receiveShadow>
        <boxGeometry args={[10, 0.8, 0.8]} />
        <meshLambertMaterial color={frameColor} flatShading />
      </mesh>
      {/* Seat tube */}
      <mesh position={[-3, 0, 3.5]} rotation-z={0.12} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 5]} />
        <meshLambertMaterial color={frameColor} flatShading />
      </mesh>
      {/* Down tube */}
      <mesh position={[2, 0, 2.2]} rotation-z={-0.25} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 5.5]} />
        <meshLambertMaterial color={frameColor} flatShading />
      </mesh>
      {/* Seat stay */}
      <mesh position={[-3.5, 0, 1.5]} rotation-z={-0.4} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 4]} />
        <meshLambertMaterial color={frameColor} flatShading />
      </mesh>
      {/* Chain stay */}
      <mesh position={[-2.5, 0, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.5, 0.5]} />
        <meshLambertMaterial color={frameColor} flatShading />
      </mesh>
      {/* Fork */}
      <mesh position={[5, 0, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.6, 3.5]} />
        <meshLambertMaterial color={0x666666} flatShading />
      </mesh>
      {/* Rear wheel */}
      <group position={[-5, 0, 0.5]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[2.8, 0.35, 6, 16]} />
          <meshLambertMaterial color={0x222222} flatShading />
        </mesh>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.5, 6, 6]} />
          <meshLambertMaterial color={0x999999} flatShading />
        </mesh>
      </group>
      {/* Front wheel */}
      <group position={[5, 0, 0.5]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[2.8, 0.35, 6, 16]} />
          <meshLambertMaterial color={0x222222} flatShading />
        </mesh>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.5, 6, 6]} />
          <meshLambertMaterial color={0x999999} flatShading />
        </mesh>
      </group>
      {/* Handlebars */}
      <mesh position={[5, 0, 3.5]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 4, 0.5]} />
        <meshLambertMaterial color={0x333333} flatShading />
      </mesh>
      {/* Drop bar curve */}
      <mesh position={[5, 0, 2.5]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 3.5, 1.5]} />
        <meshLambertMaterial color={0x333333} flatShading />
      </mesh>
      {/* Saddle */}
      <mesh position={[-3, 0, 6.2]} castShadow receiveShadow>
        <boxGeometry args={[3, 1.5, 0.6]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      {/* Seatpost */}
      <mesh position={[-3, 0, 5.5]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 1.5]} />
        <meshLambertMaterial color={0x888888} flatShading />
      </mesh>
      {/* Cranks / pedals hint */}
      <mesh position={[-0.5, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.4, 0.4]} />
        <meshLambertMaterial color={0x888888} flatShading />
      </mesh>
    </group>
  );
}

const floatTypes = ['tyre', 'bidon', 'cassette'] as const;

const caravanColors = [
  { body: 0xf44336, trim: 0xffffff },  // red
  { body: 0xfdd835, trim: 0xe53935 },  // yellow
  { body: 0x43a047, trim: 0xffffff },  // green
  { body: 0x1e88e5, trim: 0xfdd835 },  // blue
  { body: 0xff9800, trim: 0x212121 },  // orange
];

function CaravanFloat({ index }: { index: number }) {
  const w = tileSize * 1.3;
  const d = tileSize * 0.45;
  const colors = caravanColors[index % caravanColors.length];
  const floatType = floatTypes[index % floatTypes.length];

  return (
    <group>
      {/* ---- Truck cab ---- */}
      <mesh position={[w * 0.35, 0, 5]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.25, d, 6]} />
        <meshLambertMaterial color={0xeeeeee} flatShading />
      </mesh>
      <mesh position={[w * 0.42, 0, 8]} castShadow receiveShadow>
        <boxGeometry args={[2, d * 0.7, 3]} />
        <meshLambertMaterial color={0x90caf9} flatShading />
      </mesh>
      <mesh position={[w * 0.35, 0, 9]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.26, d * 0.95, 1]} />
        <meshLambertMaterial color={0xdddddd} flatShading />
      </mesh>

      {/* ---- Float body ---- */}
      <mesh position={[-3, 0, 5]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.65, d, 7]} />
        <meshLambertMaterial color={colors.body} flatShading />
      </mesh>
      {/* Side trim stripes */}
      <mesh position={[-3, d / 2 + 0.1, 5.5]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.6, 0.3, 2.5]} />
        <meshLambertMaterial color={colors.trim} flatShading />
      </mesh>
      <mesh position={[-3, -(d / 2 + 0.1), 5.5]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.6, 0.3, 2.5]} />
        <meshLambertMaterial color={colors.trim} flatShading />
      </mesh>
      <mesh position={[-3, d / 2 + 0.15, 3.5]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.55, 0.2, 1]} />
        <meshLambertMaterial color={colors.trim} flatShading />
      </mesh>
      <mesh position={[-3, -(d / 2 + 0.15), 3.5]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.55, 0.2, 1]} />
        <meshLambertMaterial color={colors.trim} flatShading />
      </mesh>

      {/* ---- Platform ---- */}
      <mesh position={[-3, 0, 9]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.67, d * 0.95, 1]} />
        <meshLambertMaterial color={colors.body} flatShading />
      </mesh>

      {/* ---- Sponsor item on top ---- */}
      <group position={[-3, 0, 10]}>
        {floatType === 'tyre' && <TyreFloat />}
        {floatType === 'bidon' && <BidonFloat />}
        {floatType === 'cassette' && <CassetteFloat />}
      </group>

      {/* ---- Wheels ---- */}
      <mesh position={[w * 0.3, d * 0.45, 2]} castShadow receiveShadow>
        <sphereGeometry args={[2.5, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      <mesh position={[w * 0.3, -d * 0.45, 2]} castShadow receiveShadow>
        <sphereGeometry args={[2.5, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      <mesh position={[-w * 0.25, d * 0.45, 2]} castShadow receiveShadow>
        <sphereGeometry args={[2.5, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      <mesh position={[-w * 0.25, -d * 0.45, 2]} castShadow receiveShadow>
        <sphereGeometry args={[2.5, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
    </group>
  );
}

// ---- Three sponsor float types ----

function TyreFloat() {
  const groupRef = useRef(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 0.4;
  });
  return (
    <group ref={groupRef}>
      {/* Stack of 3 oversized tyres */}
      {[0, 8, 16].map((zOff, i) => (
        <group key={i} position={[0, 0, zOff + 5]}>
          {/* Tyre */}
          <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
            <torusGeometry args={[7, 2.5, 8, 16]} />
            <meshLambertMaterial color={0x222222} flatShading />
          </mesh>
          {/* Rim */}
          <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
            <torusGeometry args={[4.5, 1, 6, 12]} />
            <meshLambertMaterial color={0xbdbdbd} flatShading />
          </mesh>
          {/* Hub cap */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[3, 3, 1.5, 8]} />
            <meshLambertMaterial color={0x9e9e9e} flatShading />
          </mesh>
          {/* Brand stripe */}
          <mesh position={[0, 0, 0.5]} castShadow receiveShadow rotation-y={Math.PI / 2}>
            <torusGeometry args={[7.2, 0.6, 4, 16]} />
            <meshLambertMaterial color={i === 1 ? 0xfdd835 : 0xf44336} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BidonFloat() {
  const groupRef = useRef(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 0.25;
  });
  return (
    <group ref={groupRef}>
      {/* Giant bidon — ~3x vehicle height */}
      {/* Main bottle body */}
      <mesh position={[0, 0, 14]} castShadow receiveShadow>
        <cylinderGeometry args={[7, 8, 24, 12]} />
        <meshLambertMaterial color={0x00e676} flatShading />
      </mesh>
      {/* Squeeze grip indents */}
      <mesh position={[0, 0, 14]} castShadow receiveShadow>
        <cylinderGeometry args={[6, 6, 10, 12]} />
        <meshLambertMaterial color={0x00c853} flatShading />
      </mesh>
      {/* Label band */}
      <mesh position={[0, 0, 10]} castShadow receiveShadow>
        <cylinderGeometry args={[8.3, 8.3, 6, 12]} />
        <meshLambertMaterial color={0xffffff} flatShading />
      </mesh>
      {/* Label accent stripe */}
      <mesh position={[0, 0, 10]} castShadow receiveShadow>
        <cylinderGeometry args={[8.5, 8.5, 2, 12]} />
        <meshLambertMaterial color={0x1565c0} flatShading />
      </mesh>
      {/* Shoulder taper */}
      <mesh position={[0, 0, 27]} castShadow receiveShadow>
        <cylinderGeometry args={[4, 7, 4, 12]} />
        <meshLambertMaterial color={0x00e676} flatShading />
      </mesh>
      {/* Nozzle */}
      <mesh position={[0, 0, 31]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 4, 4, 8]} />
        <meshLambertMaterial color={0xeeeeee} flatShading />
      </mesh>
      {/* Nozzle tip / pull cap */}
      <mesh position={[0, 0, 34]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 2.5, 2.5, 8]} />
        <meshLambertMaterial color={0x00e676} flatShading />
      </mesh>
      {/* Water droplet on nozzle (comic touch) */}
      <mesh position={[2, 0, 35]} castShadow receiveShadow>
        <sphereGeometry args={[1.2, 6, 6]} />
        <meshLambertMaterial color={0x81d4fa} transparent opacity={0.7} flatShading />
      </mesh>
    </group>
  );
}

function CassetteFloat() {
  const groupRef = useRef(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 0.3;
  });
  // Stack of decreasing-diameter discs to form a cassette silhouette
  const cogs = [
    { r: 10, z: 2, color: 0xbdbdbd },
    { r: 9, z: 4.5, color: 0xcccccc },
    { r: 8, z: 7, color: 0xbdbdbd },
    { r: 7.2, z: 9.5, color: 0xcccccc },
    { r: 6.5, z: 12, color: 0xbdbdbd },
    { r: 5.8, z: 14.5, color: 0xcccccc },
    { r: 5.2, z: 17, color: 0xbdbdbd },
  ];
  return (
    <group ref={groupRef}>
      {/* Central axle */}
      <mesh position={[0, 0, 10]} rotation-x={Math.PI / 2} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 20, 6]} />
        <meshLambertMaterial color={0x757575} flatShading />
      </mesh>
      {/* Cog discs — each slightly thinner */}
      {cogs.map((cog, i) => (
        <group key={i} position={[0, 0, cog.z]}>
          {/* Disc */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[cog.r, cog.r, 1.8, 16]} />
            <meshLambertMaterial color={cog.color} flatShading />
          </mesh>
          {/* Spacer ring */}
          <mesh position={[0, 0, 1.2]} castShadow receiveShadow>
            <cylinderGeometry args={[2.5, 2.5, 0.6, 8]} />
            <meshLambertMaterial color={0x424242} flatShading />
          </mesh>
        </group>
      ))}
      {/* Lockring on top */}
      <mesh position={[0, 0, 19]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 1.5, 8]} />
        <meshLambertMaterial color={0x212121} flatShading />
      </mesh>
    </group>
  );
}
