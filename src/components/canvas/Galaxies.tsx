"use client";

import { useMemo } from "react";
import * as THREE from "three";

const getSoftTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(255,255,255,0.8)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
};

const particleTexture =
  typeof document === "undefined" ? new THREE.Texture() : getSoftTexture();

function gaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
}

function GalaxyPoints({
  positions,
  colors,
}: {
  positions: Float32Array;
  colors: Float32Array;
}) {
  return (
    <points raycast={() => {}}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={particleTexture}
        size={1.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent
        vertexColors
        opacity={0.6}
      />
    </points>
  );
}

function SpiralGalaxy({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const { positions, colors } = useMemo(() => {
    const count = 100_000;
    const size = 150;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const coreColor = new THREE.Color("#ffccaa");
    const armColor = new THREE.Color("#1144cc");
    const mixedColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = Math.pow(Math.random(), 3) * size;
      const spinAngle = radius * 0.2;
      const branchAngle = ((i % 3) / 3) * Math.PI * 2;
      const scatter = Math.pow(Math.random(), 2) * (radius * 0.5 + 2);
      const randomX = (Math.random() - 0.5) * scatter;
      const randomY = (Math.random() - 0.5) * (scatter * 0.5);
      const randomZ = (Math.random() - 0.5) * scatter;

      const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
      const y = randomY;
      const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const i3 = i * 3;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      mixedColor.copy(coreColor).lerp(armColor, radius / size);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    return { positions, colors };
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <GalaxyPoints positions={positions} colors={colors} />
    </group>
  );
}

function EllipticalGalaxy({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const { positions, colors } = useMemo(() => {
    const count = 50_000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const core = new THREE.Color("#ffccaa");
    const halo = new THREE.Color("#cc5533");
    const mixed = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = gaussian() * 70;
      const y = gaussian() * 38;
      const z = gaussian() * 52;
      const i3 = i * 3;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      const dist = Math.sqrt(x * x + y * y + z * z);
      mixed.copy(core).lerp(halo, Math.min(dist / 90, 1));
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    return { positions, colors };
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <GalaxyPoints positions={positions} colors={colors} />
    </group>
  );
}

function RingGalaxy({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const { positions, colors } = useMemo(() => {
    const count = 50_000;
    const baseRadius = 40;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const inner = new THREE.Color("#ddeeff");
    const outer = new THREE.Color("#1144cc");
    const mixed = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * baseRadius + gaussian() * 14;
      const y = gaussian() * 8;
      const z = Math.sin(theta) * baseRadius + gaussian() * 14;
      const i3 = i * 3;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      const radial = Math.hypot(x, z);
      mixed.copy(inner).lerp(outer, Math.min(Math.abs(radial - baseRadius) / 28, 1));
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    return { positions, colors };
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <GalaxyPoints positions={positions} colors={colors} />
    </group>
  );
}

export default function Galaxies() {
  return (
    <group>
      <SpiralGalaxy
        position={[-70, -28, -85]}
        rotation={[0.22, -0.12, 0.48]}
        scale={1}
      />
      <EllipticalGalaxy
        position={[210, 130, -190]}
        rotation={[0.15, -0.4, 0.2]}
        scale={1.15}
      />
      <RingGalaxy
        position={[180, 40, 220]}
        rotation={[1.05, 0.2, -0.3]}
        scale={1.1}
      />
    </group>
  );
}
