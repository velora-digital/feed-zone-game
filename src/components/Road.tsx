import React from 'react';
import { tilesPerRow, tileSize } from '@/utils/constants';
import GridLines from './GridLines';

const roadWidth = tilesPerRow * tileSize;
const roadHeight = 1; // small height to prevent z-fighting with grass

export default function Road({ rowIndex, children }) {
  return (
    <group position-y={rowIndex * tileSize}>
      {/* Main road surface */}
      <mesh receiveShadow position-z={-roadHeight / 2}>
        <boxGeometry args={[roadWidth, tileSize, roadHeight]} />
        <meshLambertMaterial color={0x454a59} flatShading />
      </mesh>
      <mesh receiveShadow position-x={roadWidth} position-z={-roadHeight / 2}>
        <boxGeometry args={[roadWidth, tileSize, roadHeight]} />
        <meshLambertMaterial color={0x393d49} flatShading />
      </mesh>
      <mesh receiveShadow position-x={-roadWidth} position-z={-roadHeight / 2}>
        <boxGeometry args={[roadWidth, tileSize, roadHeight]} />
        <meshLambertMaterial color={0x393d49} flatShading />
      </mesh>

      {/* White edge lines (both sides, full length across all 3 road sections) */}
      <mesh position-z={0.1} position-y={tileSize / 2 - 0.5}>
        <boxGeometry args={[roadWidth * 3, 1, 0.2]} />
        <meshLambertMaterial color={0xffffff} flatShading />
      </mesh>
      <mesh position-z={0.1} position-y={-tileSize / 2 + 0.5}>
        <boxGeometry args={[roadWidth * 3, 1, 0.2]} />
        <meshLambertMaterial color={0xffffff} flatShading />
      </mesh>

      {/* Dashed centre line */}
      <CentreLine />

      {children}
      <group position-z={2}>
        <GridLines variant="road" />
      </group>
    </group>
  );
}

function CentreLine() {
  const dashLength = 4;
  const gapLength = 4;
  const totalSpan = roadWidth * 3;
  const stride = dashLength + gapLength;
  const dashCount = Math.ceil(totalSpan / stride);
  const startX = -totalSpan / 2 + dashLength / 2;

  return (
    <group position-z={0.1}>
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={i} position-x={startX + i * stride}>
          <boxGeometry args={[dashLength, 0.8, 0.2]} />
          <meshLambertMaterial color={0xfdd835} flatShading />
        </mesh>
      ))}
    </group>
  );
}
