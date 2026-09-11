"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { simTimeRef } from "@/utils/simTime";

const ISS_INCLINATION = 51.6 * (Math.PI / 180);
const ISS_PERIOD_MS = 90 * 60 * 1000;

export default function ISS() {
  const orbitRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/iss.glb");

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      const light = child as THREE.Light;
      if (light.isLight) {
        light.intensity = 0;
        child.visible = false;
      }
    });
    return clone;
  }, [scene]);

  useFrame(() => {
    if (!orbitRef.current) return;
    orbitRef.current.rotation.y =
      (simTimeRef.current / ISS_PERIOD_MS) * (Math.PI * 2);
    orbitRef.current.rotation.z = ISS_INCLINATION;
  });

  return (
    <group ref={orbitRef}>
      <primitive object={model} scale={0.005} position={[1.2, 0, 0]} />
    </group>
  );
}

useGLTF.preload("/models/iss.glb");
