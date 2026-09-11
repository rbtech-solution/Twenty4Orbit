"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { planets } from "@/data/planets";
import { useStore } from "@/store/useStore";

const COUNT = 50000;
const mars = planets.find((body) => body.name === "Mars");
const jupiter = planets.find((body) => body.name === "Jupiter");
const innerRadius = (mars?.distance ?? 23) + (mars?.radius ?? 0.53);
const outerRadius = (jupiter?.distance ?? 32) - (jupiter?.radius ?? 2.8);

export default function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const span = outerRadius - innerRadius;

    for (let i = 0; i < COUNT; i++) {
      const radius = innerRadius + Math.random() * span;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * (radius * 0.05);
      const scale = 0.01 + Math.random() * 0.04;

      dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [dummy]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y +=
      delta * 0.02 * useStore.getState().timeScale;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[null, null, COUNT]}
        raycast={() => {}}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#666666" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
