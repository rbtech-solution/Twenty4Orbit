"use client";

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetPoi } from "@/data/planets";
import { useStore } from "@/store/useStore";

const latLongToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};

export default function PointOfInterest({
  poi,
  radius,
  planetName,
}: {
  poi: PlanetPoi;
  radius: number;
  planetName: string;
}) {
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const showLabel =
    selectedPlanet?.name === planetName || focusedPlanet === planetName;
  const position = useMemo(
    () => latLongToVector3(poi.lat, poi.lon, radius),
    [poi.lat, poi.lon, radius],
  );

  if (!showLabel) return null;

  return (
    <group position={position}>
      <Html center>
        <div className="pointer-events-none relative flex items-center">
          <div className="absolute h-2 w-2 animate-ping rounded-full bg-cyan-200/25" />
          <div className="relative h-1.5 w-1.5 rounded-full bg-cyan-100/50 shadow-[0_0_4px_rgba(186,230,253,0.35)]" />
          <span className="ml-4 whitespace-nowrap text-xs text-white/55">
            {poi.name}
          </span>
        </div>
      </Html>
    </group>
  );
}
