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
  needsFeed = false,
  animalIndex,
  packSize,
}) {
  const ref = useRef(null);
  const glowRef = useRef(null);
  const wasFeedableRef = useRef(needsFeed);
  if (needsFeed) wasFeedableRef.current = true;
  const isSoloCyclist = needsFeed || wasFeedableRef.current;
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
  useHitDetection(ref, rowIndex, needsFeed, animalIndex);
  const isVisible =
    Math.abs(rowIndex - playerState.currentRow) <= visibleTilesDistance;

  const isMotorbike = color === 0xf44336 || color === 0xff9800;

  // Pulsing glow for feedable cyclists
  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const pulse = 0.8 + 0.4 * Math.sin(clock.elapsedTime * 4);
    glowRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {isVisible && (
        <>
          {isMotorbike ? <Motorbike color={color} /> : isSoloCyclist ? <CyclistOnBike jerseyColor={needsFeed ? 0x00e676 : color} helmetColor={needsFeed ? 0x00e676 : 0xeeeeee} /> : <PelotonGroup color={color} packSize={packSize || 3} />}
          {needsFeed && (
            <group ref={glowRef}>
              {/* Pulsing ring indicator above feedable cyclists */}
              <mesh position={[0, 0, 28]} rotation-x={Math.PI / 2}>
                <torusGeometry args={[5, 1.2, 6, 16]} />
                <meshStandardMaterial
                  color={0x00e676}
                  emissive={0x00e676}
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.7}
                />
              </mesh>
              {/* Bidon icon floating above */}
              <mesh position={[0, 0, 34]}>
                <cylinderGeometry args={[1.5, 1.5, 5, 8]} />
                <meshStandardMaterial
                  color={0x00e676}
                  emissive={0x00e676}
                  emissiveIntensity={0.5}
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
      {/* Rear wheel */}
      <group position={[-9, 0, 6]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[5, 1.2, 8, 16]} />
          <meshLambertMaterial color={0x222222} flatShading />
        </mesh>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1, 6, 6]} />
          <meshLambertMaterial color={0x999999} flatShading />
        </mesh>
      </group>
      {/* Front wheel */}
      <group position={[9, 0, 6]}>
        <mesh castShadow receiveShadow rotation-y={Math.PI / 2}>
          <torusGeometry args={[5, 1.2, 8, 16]} />
          <meshLambertMaterial color={0x222222} flatShading />
        </mesh>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1, 6, 6]} />
          <meshLambertMaterial color={0x999999} flatShading />
        </mesh>
      </group>
      {/* Bike body — long flat box */}
      <mesh position={[0, 0, 9]} castShadow receiveShadow>
        <boxGeometry args={[20, 6, 4]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
      {/* Rider torso */}
      <mesh position={[2, 0, 15]} rotation-z={0.2} castShadow receiveShadow>
        <boxGeometry args={[6, 4, 6]} />
        <meshLambertMaterial color={0x333333} flatShading />
      </mesh>
      {/* Rider head + helmet */}
      <mesh position={[4, 0, 20]} castShadow receiveShadow>
        <sphereGeometry args={[2.5, 8, 8]} />
        <meshLambertMaterial color={0x222222} flatShading />
      </mesh>
      {/* Camera body — small box behind rider, raised */}
      <mesh position={[-5, 0, 22]} castShadow receiveShadow>
        <boxGeometry args={[5, 4, 4]} />
        <meshLambertMaterial color={0x212121} flatShading />
      </mesh>
      {/* Camera lens — white cylinder to stand out */}
      <mesh position={[-5, 3, 22]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.4, 3, 8]} />
        <meshLambertMaterial color={0xffffff} flatShading />
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
