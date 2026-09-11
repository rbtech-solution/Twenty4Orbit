"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls } from "three-stdlib";
import { useStore } from "@/store/useStore";

type SimClock = { current: number };

export default function CameraController({
  simTimeRef,
  controlsRef,
}: {
  simTimeRef: SimClock;
  controlsRef: React.RefObject<OrbitControls | null>;
}) {
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const focusedCity = useStore((state) => state.focusedCity);
  const isTransitioning = useRef(false);
  const targetPosition = useRef(new THREE.Vector3());
  const cameraOffset = useRef(new THREE.Vector3());

  useEffect(() => {
    isTransitioning.current = true;
  }, [selectedPlanet]);

  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (focusedCity) {
      controls.enabled = false;
      return;
    }

    controls.enabled = true;

    if (selectedPlanet?.name === "Earth") {
      controls.minDistance = Math.max(1.02, selectedPlanet.radius * 1.02);
      controls.zoomSpeed = 0.85;
      controls.enablePan = false;
    } else if (selectedPlanet) {
      controls.minDistance = Math.max(0.35, selectedPlanet.radius * 1.15);
      controls.zoomSpeed = 1;
      controls.enablePan = false;
    } else {
      controls.minDistance = 0.08;
      controls.zoomSpeed = 1.2;
      controls.enablePan = false;
    }

    if (!selectedPlanet) {
      targetPosition.current.set(0, 0, 0);
      cameraOffset.current.set(0, 48, 95);
    } else if (!selectedPlanet.orbitalPeriod || selectedPlanet.distance <= 0) {
      const pullback = Math.max(8, selectedPlanet.radius * 2.2);
      targetPosition.current.set(0, 0, 0);
      cameraOffset.current.set(pullback, pullback * 0.45, pullback);
    } else {
      const periodMs = selectedPlanet.orbitalPeriod * 24 * 60 * 60 * 1000;
      const angle = (simTimeRef.current / periodMs) * (Math.PI * 2);
      const a = selectedPlanet.distance;
      const b = a * Math.sqrt(1 - Math.pow(selectedPlanet.eccentricity, 2));
      const c = a * selectedPlanet.eccentricity;
      const targetX = a * Math.cos(angle) + c;
      const targetZ = b * Math.sin(angle);
      const pullback = Math.max(2, selectedPlanet.radius * 3.2);

      targetPosition.current.set(targetX, 0, targetZ);
      cameraOffset.current.set(
        targetX + pullback,
        Math.max(1.5, selectedPlanet.radius * 1.1),
        targetZ + pullback,
      );
    }

    controls.target.lerp(targetPosition.current, delta * 4);

    if (isTransitioning.current) {
      state.camera.position.lerp(cameraOffset.current, delta * 4);

      if (state.camera.position.distanceTo(cameraOffset.current) < 0.2) {
        isTransitioning.current = false;
      }
    }

    controls.update();
  });

  return null;
}
