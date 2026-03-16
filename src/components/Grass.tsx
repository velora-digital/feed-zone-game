import React from 'react';
import { tilesPerRow, tileSize } from '@/utils/constants';
import GridLines from './GridLines';
import { GrassProps } from '@/types';

const buntingColors = [0xe53935, 0xfdd835, 0x1e88e5, 0x43a047, 0xffffff, 0xff9800, 0xf48fb1, 0x7b1fa2];

// Grassy roadside / feed zone verge — green with bunting everywhere
export default function Grass({ rowIndex, children }: GrassProps) {
  const variant = Math.abs(rowIndex) % 3;
  let mainColor = 0x5da839;
  let sideColor = 0x4e9430;
  if (variant === 1) {
    mainColor = 0x6bb844;
    sideColor = 0x5aa538;
  } else if (variant === 2) {
    mainColor = 0x4f9a2e;
    sideColor = 0x438826;
  }

  // Bunting on every positive row — alternate between high and low strings
  const showHighBunting = rowIndex > 0 && rowIndex % 2 === 0;
  const showLowBunting = rowIndex > 0 && rowIndex % 2 === 1;

  return (
    <group position-y={rowIndex * tileSize}>
      <mesh receiveShadow>
        <boxGeometry args={[tilesPerRow * tileSize, tileSize, 3]} />
        <meshLambertMaterial color={mainColor} flatShading />
      </mesh>
      <mesh receiveShadow position-x={tilesPerRow * tileSize}>
        <boxGeometry args={[tilesPerRow * tileSize, tileSize, 3]} />
        <meshLambertMaterial color={sideColor} flatShading />
      </mesh>
      <mesh receiveShadow position-x={-tilesPerRow * tileSize}>
        <boxGeometry args={[tilesPerRow * tileSize, tileSize, 3]} />
        <meshLambertMaterial color={sideColor} flatShading />
      </mesh>
      {/* Bunting across the lane */}
      {showHighBunting && <BuntingString z={20} count={11} offset={rowIndex} />}
      {showLowBunting && <BuntingString z={14} count={9} offset={rowIndex + 3} />}
      {/* Edge bunting along the sides */}
      {rowIndex > 0 && (
        <>
          <EdgeBunting side={-1} offset={rowIndex} />
          <EdgeBunting side={1} offset={rowIndex + 2} />
        </>
      )}
      {children}
      <group position-z={2}>
        <GridLines variant="grass" />
      </group>
    </group>
  );
}

function BuntingString({ z, count, offset }: { z: number; count: number; offset: number }) {
  const halfWidth = tilesPerRow * tileSize * 0.45;
  return (
    <group position-z={z}>
      {/* String */}
      <mesh>
        <boxGeometry args={[halfWidth * 2, 0.3, 0.3]} />
        <meshLambertMaterial color={0xdddddd} flatShading />
      </mesh>
      {/* Pennant flags */}
      {Array.from({ length: count }, (_, i) => {
        const x = -halfWidth + (i + 0.5) * (halfWidth * 2 / count);
        return (
          <mesh key={i} position={[x, 0.2, -1.5]}>
            <coneGeometry args={[1.5, 2.8, 3]} />
            <meshLambertMaterial color={buntingColors[(i + offset) % buntingColors.length]} flatShading />
          </mesh>
        );
      })}
    </group>
  );
}

function EdgeBunting({ side, offset }: { side: number; offset: number }) {
  // Bunting string running along the edge of the lane
  const edgeX = side * tilesPerRow * tileSize * 0.48;
  return (
    <group position={[edgeX, 0, 12]}>
      {/* Vertical string */}
      <mesh>
        <boxGeometry args={[0.3, tileSize * 0.8, 0.3]} />
        <meshLambertMaterial color={0xdddddd} flatShading />
      </mesh>
      {/* Flags along the edge */}
      {[-1, 0, 1].map((yOff, i) => (
        <mesh key={i} position={[side * 0.3, yOff * tileSize * 0.25, -1.2]}>
          <coneGeometry args={[1.2, 2.2, 3]} />
          <meshLambertMaterial color={buntingColors[(i + offset) % buntingColors.length]} flatShading />
        </mesh>
      ))}
    </group>
  );
}
