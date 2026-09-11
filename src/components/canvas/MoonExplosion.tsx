"use client";

import { useMemo, useRef } from "react";
import { Html, PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const MOON_RADIUS = 0.27;
const DEBRIS_COUNT = 5000;
const FLASH_INTENSITY = 5000;
const FLASH_DURATION = 1.5;
const SHOCKWAVE_DURATION = 1;

export function MoonDetonatePin() {
  const explodeArmed = useStore((state) => state.explodeArmed);
  const moonExplosion = useStore((state) => state.moonExplosion);
  const setExplodeArmed = useStore((state) => state.setExplodeArmed);
  const restoreMoon = useStore((state) => state.restoreMoon);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const focusedPlanet = useStore((state) => state.focusedPlanet);

  const showPin =
    explodeArmed ||
    moonExplosion !== null ||
    selectedPlanet?.name === "Earth" ||
    focusedPlanet === "Earth";

  if (!showPin) return null;

  const exploded = moonExplosion !== null;

  return (
    <Html
      center
      position={[0, MOON_RADIUS + 0.22, 0]}
      zIndexRange={[40, 0]}
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="flex flex-col items-center"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`h-2.5 w-2.5 rounded-full border shadow-[0_0_10px_rgba(251,146,60,0.55)] ${
            explodeArmed
              ? "border-orange-300 bg-orange-400"
              : exploded
                ? "border-white/40 bg-white/70"
                : "border-cyan-200/80 bg-cyan-300/90"
          }`}
        />
        <div className="h-5 w-px bg-white/45" />
        {exploded ? (
          <button
            type="button"
            onClick={() => restoreMoon()}
            className="rounded-full border border-white/25 bg-black/75 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/90 backdrop-blur-md hover:border-white/50 hover:bg-black/90"
          >
            Restore
          </button>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={explodeArmed}
            onClick={() => setExplodeArmed(!explodeArmed)}
            className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-md transition-colors ${
              explodeArmed
                ? "border-orange-400/70 bg-orange-500/20 text-orange-200 shadow-[0_0_18px_rgba(251,146,60,0.35)]"
                : "border-white/25 bg-black/75 text-white/85 hover:border-orange-300/50 hover:text-orange-100"
            }`}
          >
            {explodeArmed ? "Armed — click Moon" : "Explode"}
          </button>
        )}
      </div>
    </Html>
  );
}

function createDebrisField(radius: number) {
  const positions = new Float32Array(DEBRIS_COUNT * 3);
  const velocities = new Float32Array(DEBRIS_COUNT * 3);
  const direction = new THREE.Vector3();

  for (let i = 0; i < DEBRIS_COUNT; i++) {
    direction.randomDirection();
    const spawnRadius = radius * Math.cbrt(Math.random());
    const speed = 0.9 + Math.random() * 3.8;
    const i3 = i * 3;

    positions[i3] = direction.x * spawnRadius;
    positions[i3 + 1] = direction.y * spawnRadius;
    positions[i3 + 2] = direction.z * spawnRadius;

    velocities[i3] = direction.x * speed;
    velocities[i3 + 1] = direction.y * speed;
    velocities[i3 + 2] = direction.z * speed;
  }

  return { positions, velocities };
}

export default function MoonExplosion({ radius }: { radius: number }) {
  const flashRef = useRef<THREE.PointLight>(null);
  const fireballRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.Points>(null);
  const elapsed = useRef(0);

  const { positions, velocities } = useMemo(
    () => createDebrisField(radius),
    [radius],
  );

  useFrame((state, delta) => {
    void state;
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;
    const t = elapsed.current;

    if (flashRef.current) {
      flashRef.current.intensity = THREE.MathUtils.lerp(
        FLASH_INTENSITY,
        0,
        Math.min(1, t / FLASH_DURATION),
      );
    }

    const fireball = fireballRef.current;
    if (fireball) {
      fireball.scale.x += dt * 15;
      fireball.scale.y += dt * 15;
      fireball.scale.z += dt * 15;
      const fireMat = fireball.material as THREE.MeshBasicMaterial;
      fireMat.opacity = THREE.MathUtils.lerp(1, 0, Math.min(1, t / 1.2));
      fireball.visible = fireMat.opacity > 0.001;
    }

    const shockwave = shockwaveRef.current;
    if (shockwave) {
      shockwave.scale.x += dt * 25;
      shockwave.scale.y += dt * 25;
      shockwave.scale.z += dt * 25;
      const shockMat = shockwave.material as THREE.MeshBasicMaterial;
      shockMat.opacity = THREE.MathUtils.lerp(1, 0, Math.min(1, t / SHOCKWAVE_DURATION));
      shockwave.visible = shockMat.opacity > 0.001;
    }

    const debris = debrisRef.current;
    if (debris) {
      const attr = debris.geometry.attributes.position;
      const array = attr.array as Float32Array;
      for (let i = 0; i < DEBRIS_COUNT; i++) {
        const i3 = i * 3;
        array[i3] += velocities[i3] * dt;
        array[i3 + 1] += velocities[i3 + 1] * dt;
        array[i3 + 2] += velocities[i3 + 2] * dt;
      }
      attr.needsUpdate = true;
      debris.geometry.computeBoundingSphere();
    }
  });

  return (
    <group frustumCulled={false}>
      <pointLight
        ref={flashRef}
        color="#ffffff"
        intensity={FLASH_INTENSITY}
        distance={0}
        decay={2}
      />

      <mesh ref={fireballRef} scale={radius} raycast={() => {}}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        ref={shockwaveRef}
        rotation={[Math.PI / 2, 0, 0]}
        raycast={() => {}}
      >
        <ringGeometry args={[1, 1.2, 64]} />
        <meshBasicMaterial
          color="#e8ffff"
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <Points
        ref={debrisRef}
        positions={positions}
        stride={3}
        frustumCulled={false}
        raycast={() => {}}
      >
        <PointMaterial
          color="#d4cfc4"
          size={0.04}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          toneMapped={false}
        />
      </Points>
    </group>
  );
}
