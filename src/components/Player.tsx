import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Bounds } from '@react-three/drei';
import { setPlayerRef, playerState } from '@/logic/playerLogic';
import { usePlayerAnimation } from '@/animation/usePlayerAnimation';
import { DirectionalLight } from '@/components/SceneHelpers';

export default function Player() {
  const player = useRef(null);
  const lightRef = useRef(null);
  const camera = useThree(state => state.camera);

  usePlayerAnimation(player);

  // Camera shake effect (runs always, even if paused)
  useFrame(() => {
    if (!player.current) return;
    if (!camera) return;
    if (playerState.shake) {
      // Shake: random offset, decaying over 600ms
      const elapsed = performance.now() - (playerState.shakeStartTime || 0);
      const duration = 600;
      const intensity = 8 * (1 - Math.min(1, elapsed / duration));
      camera.position.x = 300 + (Math.random() - 0.5) * intensity;
      camera.position.y = -300 + (Math.random() - 0.5) * intensity;
      camera.position.z = 300 + (Math.random() - 0.5) * intensity * 0.5;
    } else {
      // Reset camera position
      camera.position.set(300, -300, 300);
    }
  });

  useEffect(() => {
    if (!player.current) return;
    if (!lightRef.current) return;
    player.current.add(camera);
    lightRef.current.target = player.current;
    setPlayerRef(player.current);
  });

  return (
    <Bounds fit clip observe margin={10}>
      <group ref={player}>
        <SoigneurBody />
        <DirectionalLight ref={lightRef} />
      </group>
    </Bounds>
  );
}

export function SoigneurBody() {
  const group = useRef();
  useFrame(() => {
    if (!group.current) return;
    const player = group.current;
    // Animate squash/stretch — read from this group's z which is set by usePlayerAnimation
    const z = group.current.position.z;
    const progress = Math.min(1, Math.abs(z) / 12);
    const scaleY = 1 + 0.3 * progress;
    const scaleX = 1 - 0.15 * progress;
    const scaleZ = 1 - 0.15 * progress;
    player.children[0].scale.set(scaleX, scaleZ, scaleY);

    // Animate opacity and grow-from-ground on respawn
    if (playerState.respawning) {
      const duration = playerState.respawnDuration || 1200; // ms
      const elapsed = performance.now() - (playerState.respawnStartTime || 0);
      const t = Math.min(1, elapsed / duration);
      const opacity = t;
      const grow = 0.1 + 0.9 * t; // scale from 0.1 to 1
      // Set opacity and scale for all meshes in the group
      player.traverse(obj => {
        if (obj.material) {
          obj.material.transparent = true;
          obj.material.opacity = opacity;
        }
      });
      player.scale.set(grow, grow, grow);
      if (opacity >= 1) {
        playerState.respawning = false;
        player.scale.set(1, 1, 1);
      }
    } else {
      // Ensure fully visible and normal scale if not respawning
      player.traverse(obj => {
        if (obj.material) {
          obj.material.transparent = false;
          obj.material.opacity = 1;
        }
      });
      player.scale.set(1, 1, 1);
    }
  });
  return (
    <group ref={group}>
      {/* Soigneur: boxy person with musette bag and bidon */}
      <group>
        {/* Torso (team polo shirt - green to match feedable cyclists) */}
        <mesh position={[0, 0, 13]} castShadow receiveShadow>
          <boxGeometry args={[10, 6, 12]} />
          <meshLambertMaterial color={0x00e676} flatShading />
        </mesh>
        {/* Head (skin tone) */}
        <mesh position={[0, 0, 23]} castShadow receiveShadow>
          <boxGeometry args={[6, 6, 6]} />
          <meshLambertMaterial color={0xffcc99} flatShading />
        </mesh>
        {/* Cap (team cap - darker green) */}
        <mesh position={[0, 0, 27]} castShadow receiveShadow>
          <boxGeometry args={[7, 7, 2]} />
          <meshLambertMaterial color={0x00c853} flatShading />
        </mesh>
        {/* Cap brim */}
        <mesh position={[0, 3.5, 25.5]} castShadow receiveShadow>
          <boxGeometry args={[7, 3, 1]} />
          <meshLambertMaterial color={0x00c853} flatShading />
        </mesh>
        {/* Left Eye */}
        <mesh position={[-1.5, 3.1, 24]} castShadow receiveShadow>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshLambertMaterial color={0x222222} />
        </mesh>
        {/* Right Eye */}
        <mesh position={[1.5, 3.1, 24]} castShadow receiveShadow>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshLambertMaterial color={0x222222} />
        </mesh>
        {/* Left Arm (holding musette out) */}
        <mesh position={[-7, 2, 14]} castShadow receiveShadow>
          <boxGeometry args={[3, 3, 10]} />
          <meshLambertMaterial color={0xffcc99} flatShading />
        </mesh>
        {/* Right Arm (holding bidon out) */}
        <mesh position={[7, 2, 14]} castShadow receiveShadow>
          <boxGeometry args={[3, 3, 10]} />
          <meshLambertMaterial color={0xffcc99} flatShading />
        </mesh>
        {/* Bidon bottle (in right hand) */}
        <mesh position={[7, 5, 16]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 6, 8]} />
          <meshLambertMaterial color={0x00e676} flatShading />
        </mesh>
        {/* Bidon cap */}
        <mesh position={[7, 5, 19.5]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 1, 1.5, 8]} />
          <meshLambertMaterial color={0xeeeeee} flatShading />
        </mesh>

        {/* ---- Musette bag (left side) ---- */}
        {/* Strap across chest */}
        <mesh position={[0, 0, 17]} rotation-z={0.5} castShadow receiveShadow>
          <boxGeometry args={[14, 1.2, 0.8]} />
          <meshLambertMaterial color={0xfdd835} flatShading />
        </mesh>
        {/* Musette bag body — hanging from left hand */}
        <mesh position={[-7, 4, 10]} castShadow receiveShadow>
          <boxGeometry args={[6, 3, 7]} />
          <meshLambertMaterial color={0xfdd835} flatShading />
        </mesh>
        {/* Musette bag flap */}
        <mesh position={[-7, 5.6, 13]} castShadow receiveShadow>
          <boxGeometry args={[6.5, 0.6, 2.5]} />
          <meshLambertMaterial color={0xf9a825} flatShading />
        </mesh>
        {/* Team logo stripe on musette */}
        <mesh position={[-7, 4.6, 10]} castShadow receiveShadow>
          <boxGeometry args={[5, 0.3, 2]} />
          <meshLambertMaterial color={0x00c853} flatShading />
        </mesh>
        {/* Bidons poking out of musette */}
        <mesh position={[-8, 4.5, 13.5]} rotation-x={0.3} castShadow receiveShadow>
          <cylinderGeometry args={[1, 1, 4, 6]} />
          <meshLambertMaterial color={0x00e676} flatShading />
        </mesh>
        <mesh position={[-6, 4.5, 13]} rotation-x={-0.2} castShadow receiveShadow>
          <cylinderGeometry args={[1, 1, 3.5, 6]} />
          <meshLambertMaterial color={0x29b6f6} flatShading />
        </mesh>

        {/* Left Leg */}
        <mesh position={[-2.5, 0, 3]} castShadow receiveShadow>
          <boxGeometry args={[3, 3, 7]} />
          <meshLambertMaterial color={0x333333} flatShading />
        </mesh>
        {/* Right Leg */}
        <mesh position={[2.5, 0, 3]} castShadow receiveShadow>
          <boxGeometry args={[3, 3, 7]} />
          <meshLambertMaterial color={0x333333} flatShading />
        </mesh>
        {/* Shoes */}
        <mesh position={[-2.5, 1, 0.5]} castShadow receiveShadow>
          <boxGeometry args={[3.5, 5, 2]} />
          <meshLambertMaterial color={0xeeeeee} flatShading />
        </mesh>
        <mesh position={[2.5, 1, 0.5]} castShadow receiveShadow>
          <boxGeometry args={[3.5, 5, 2]} />
          <meshLambertMaterial color={0xeeeeee} flatShading />
        </mesh>
      </group>
    </group>
  );
}
