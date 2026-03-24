import React, { useRef } from 'react';
import * as THREE from 'three';
import { useVehicleAnimation } from '@/animation/useVehicleAnimation';
import { useSinglePassAnimation } from '@/animation/useSinglePassAnimation';
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
  needsFeed = false,
  isFeedableEntity = false,
  animalIndex,
  packSize,
  feedWindowStart,
  feedWindowDuration,
}) {
  const ref = useRef(null);
  const glowRef = useRef<THREE.Group>(null);
  const isSoloCyclist = isFeedableEntity;
  const wrapLength = (maxTileIndex - minTileIndex + 4) * tileSize;
  const beginningOfRow = (minTileIndex - 2) * tileSize;
  const endOfRow = (maxTileIndex + 2) * tileSize;
  const offset = (ballIndex / total) * wrapLength;

  // Feedable entities always use single-pass (stable from first render)
  // Non-feedable entities always use looping
  useVehicleAnimation(
    isFeedableEntity ? { current: null } : ref,
    direction,
    speed,
    offset,
    wrapLength,
    beginningOfRow,
    endOfRow
  );
  useSinglePassAnimation(
    isFeedableEntity ? ref : { current: null },
    direction,
    feedWindowStart,
    feedWindowDuration,
  );
  useHitDetection(ref, rowIndex, needsFeed, animalIndex);
  const isVisible =
    Math.abs(rowIndex - playerState.currentRow) <= visibleTilesDistance;

  const isMotorbike = color === 0xf44336 || color === 0xff9800;

  // Pulsing amber indicator for feedable cyclists
  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const pulse = 0.8 + 0.3 * Math.sin(clock.elapsedTime * 5);
    glowRef.current.scale.set(pulse, pulse, pulse);
    // Bob up and down
    glowRef.current.position.z = 28 + 2 * Math.sin(clock.elapsedTime * 3);
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {isVisible && (
        <>
          {isMotorbike ? <Motorbike color={color} /> : isSoloCyclist ? <CyclistOnBike jerseyColor={0x00e676} helmetColor={0xeeeeee} /> : <PelotonGroup color={color} packSize={packSize || 3} />}
          {needsFeed && (
            <group ref={glowRef} position={[0, 0, 28]}>
              {/* Pulsing amber diamond indicator above feedable cyclist */}
              <mesh rotation-x={Math.PI / 4} rotation-z={Math.PI / 4}>
                <boxGeometry args={[5, 5, 5]} />
                <meshStandardMaterial
                  color={0xffaa00}
                  emissive={0xffaa00}
                  emissiveIntensity={0.9}
                  transparent
                  opacity={0.85}
                />
              </mesh>
              {/* Down arrow below diamond */}
              <mesh position={[0, 0, -5]}>
                <coneGeometry args={[3, 4, 4]} />
                <meshStandardMaterial
                  color={0xffaa00}
                  emissive={0xffaa00}
                  emissiveIntensity={0.7}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </group>
          )}
        </>
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

function MotorbikeRecLight() {
  const lightRef = useRef<any>(null);
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    // Flash on/off every ~0.5s
    const on = Math.sin(clock.elapsedTime * 6) > 0;
    lightRef.current.material.emissiveIntensity = on ? 1.5 : 0;
    lightRef.current.material.opacity = on ? 1 : 0.3;
  });
  return (
    <mesh ref={lightRef} position={[-3, 0, 25]} castShadow receiveShadow>
      <sphereGeometry args={[0.8, 6, 6]} />
      <meshStandardMaterial
        color={0xff1744}
        emissive={0xff1744}
        emissiveIntensity={1.5}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

function Motorbike({ color }: { color: number }) {
  return (
    <group>
      {/* === Wheels === */}
      {/* Rear wheel */}
      <group position={[-10, 0, 6]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[6, 1.5, 8, 16]} />
          <meshLambertMaterial color={0x222222} flatShading />
        </mesh>
        <mesh><sphereGeometry args={[2, 6, 6]} /><meshLambertMaterial color={0x666666} flatShading /></mesh>
      </group>
      {/* Front wheel */}
      <group position={[10, 0, 6]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[6, 1.5, 8, 16]} />
          <meshLambertMaterial color={0x222222} flatShading />
        </mesh>
        <mesh><sphereGeometry args={[2, 6, 6]} /><meshLambertMaterial color={0x666666} flatShading /></mesh>
      </group>

      {/* === Frame & body === */}
      {/* Main frame — angled from rear axle to front */}
      <mesh position={[0, 0, 7]} castShadow receiveShadow>
        <boxGeometry args={[22, 5, 3]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
      {/* Fuel tank */}
      <mesh position={[3, 0, 10]} castShadow receiveShadow>
        <boxGeometry args={[8, 5, 3]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
      {/* Front fork */}
      <mesh position={[9, 0, 6]} rotation-z={0.3} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 8]} />
        <meshLambertMaterial color={0x888888} flatShading />
      </mesh>
      {/* Handlebars */}
      <mesh position={[10, 0, 11]} castShadow receiveShadow>
        <boxGeometry args={[3, 8, 1.5]} />
        <meshLambertMaterial color={0x333333} flatShading />
      </mesh>
      {/* Seat */}
      <mesh position={[-2, 0, 11]} castShadow receiveShadow>
        <boxGeometry args={[12, 5, 2]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      {/* Exhaust pipe */}
      <mesh position={[-8, -2, 6]} castShadow receiveShadow rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.8, 1, 6, 6]} />
        <meshLambertMaterial color={0x999999} flatShading />
      </mesh>

      {/* === Driver (front) === */}
      {/* Driver torso — leaning forward */}
      <mesh position={[4, 0, 16]} rotation-z={0.4} castShadow receiveShadow>
        <boxGeometry args={[7, 4, 5]} />
        <meshLambertMaterial color={0x1a1a1a} flatShading />
      </mesh>
      {/* Driver arms reaching to handlebars */}
      <mesh position={[8, 2, 14]} rotation-z={0.5} castShadow receiveShadow>
        <boxGeometry args={[6, 2, 2]} />
        <meshLambertMaterial color={0x1a1a1a} flatShading />
      </mesh>
      <mesh position={[8, -2, 14]} rotation-z={0.5} castShadow receiveShadow>
        <boxGeometry args={[6, 2, 2]} />
        <meshLambertMaterial color={0x1a1a1a} flatShading />
      </mesh>
      {/* Driver head + helmet */}
      <mesh position={[6, 0, 21]} castShadow receiveShadow>
        <sphereGeometry args={[2.5, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      {/* Helmet visor */}
      <mesh position={[8, 0, 21]} castShadow receiveShadow>
        <boxGeometry args={[1, 3.5, 2]} />
        <meshLambertMaterial color={0x90caf9} flatShading />
      </mesh>

      {/* === Camera operator (back) === */}
      {/* Cameraman torso — sitting upright */}
      <mesh position={[-5, 0, 16]} castShadow receiveShadow>
        <boxGeometry args={[6, 5, 6]} />
        <meshLambertMaterial color={0x444444} flatShading />
      </mesh>
      {/* Cameraman head */}
      <mesh position={[-5, 0, 22]} castShadow receiveShadow>
        <sphereGeometry args={[2.5, 8, 8]} />
        <meshLambertMaterial color={0xffcc99} flatShading />
      </mesh>
      {/* Headset */}
      <mesh position={[-5, 0, 24]} castShadow receiveShadow>
        <boxGeometry args={[6, 6, 1]} />
        <meshLambertMaterial color={0x333333} flatShading />
      </mesh>
      {/* Camera on shoulder — boxy TV camera */}
      <mesh position={[-5, 3, 22]} castShadow receiveShadow>
        <boxGeometry args={[7, 4, 4]} />
        <meshLambertMaterial color={0x212121} flatShading />
      </mesh>
      {/* Camera lens — white cylinder pointing sideways */}
      <mesh position={[-5, 6, 22]} rotation-x={Math.PI / 2} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 4, 8]} />
        <meshLambertMaterial color={0xeeeeee} flatShading />
      </mesh>
      {/* Lens hood */}
      <mesh position={[-5, 8, 22]} rotation-x={Math.PI / 2} castShadow receiveShadow>
        <cylinderGeometry args={[2, 1.5, 1.5, 8]} />
        <meshLambertMaterial color={0x111111} flatShading />
      </mesh>
      {/* Flashing red recording light */}
      <MotorbikeRecLight />
    </group>
  );
}

const HELMET_PALETTE = [0xeeeeee, 0xffeb3b, 0x90caf9, 0xff8a80, 0xce93d8, 0xa5d6a7];

function PelotonGroup({ color, packSize = 3 }: { color: number; packSize?: number }) {
  const spacing = 12;
  const totalWidth = (packSize - 1) * spacing;
  const startX = -totalWidth / 2;

  return (
    <group>
      {Array.from({ length: packSize }, (_, i) => {
        const jerseyColor = i % 2 === 0 ? color : (color + 0x222222) & 0xffffff;
        const helmetColor = HELMET_PALETTE[i % HELMET_PALETTE.length];
        return (
          <CyclistOnBike
            key={i}
            jerseyColor={jerseyColor}
            helmetColor={helmetColor}
            offsetX={startX + i * spacing}
          />
        );
      })}
    </group>
  );
}
