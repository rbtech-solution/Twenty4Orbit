"use client";

import { useEffect, useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { cities, type City } from "@/data/locations";
import { latLongToVector3 } from "@/utils/geo";
import { useStore } from "@/store/useStore";
import { cameraControlsRef } from "./cameraControlsRef";
import FlightPaths from "./FlightPaths";

function CityMarker({ city, earthRadius }: { city: City; earthRadius: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(
    () => latLongToVector3(city.lat, city.lng, earthRadius),
    [city.lat, city.lng, earthRadius],
  );
  const setFocusedCity = useStore((state) => state.setFocusedCity);
  const focusedCity = useStore((state) => state.focusedCity);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const earthSelected =
    selectedPlanet?.name === "Earth" || focusedPlanet === "Earth";
  const isActive = focusedCity === city.name;

  const flyToCity = () => {
    const parent = meshRef.current?.parent;
    const controls = cameraControlsRef.current;
    if (!parent || !controls) return;

    const lookAt = pos.clone();
    const camPos = pos.clone().multiplyScalar(1.2);
    parent.localToWorld(lookAt);
    parent.localToWorld(camPos);

    controls.target.copy(lookAt);
    controls.object.position.copy(camPos);
    controls.update();

    setFocusedCity(city.name);
  };

  return (
    <mesh
      ref={meshRef}
      position={pos}
      onClick={(event) => {
        event.stopPropagation();
        flyToCity();
      }}
    >
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshBasicMaterial
        color={isActive ? "#ffffff" : "#00ffcc"}
        toneMapped={false}
      />
      {earthSelected && (
        <Html center distanceFactor={2.4} occlude={false} zIndexRange={[20, 0]}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              flyToCity();
            }}
            className={`pointer-events-auto -translate-y-4 whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] backdrop-blur-md transition-colors ${
              isActive
                ? "border-cyan-300/80 bg-cyan-400/20 text-white"
                : "border-white/20 bg-black/50 text-cyan-100 hover:border-cyan-300/50 hover:text-white"
            }`}
          >
            {city.name}
          </button>
        </Html>
      )}
    </mesh>
  );
}

export default function EarthMarkers({
  earthRadius,
}: {
  earthRadius: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const focusedCity = useStore((state) => state.focusedCity);
  const hadCityFocus = useRef(false);

  useEffect(() => {
    if (focusedCity) {
      hadCityFocus.current = true;
      return;
    }

    if (!hadCityFocus.current) return;
    hadCityFocus.current = false;

    const controls = cameraControlsRef.current;
    const earth = groupRef.current?.parent;
    if (!controls || !earth) return;

    const lookAt = new THREE.Vector3();
    earth.getWorldPosition(lookAt);
    const dist = 3.5;
    controls.target.copy(lookAt);
    controls.object.position.set(
      lookAt.x + dist,
      lookAt.y + dist * 0.2,
      lookAt.z + dist,
    );
    controls.update();
  }, [focusedCity]);

  return (
    <group ref={groupRef}>
      <FlightPaths earthRadius={earthRadius} />
      {cities.map((city) => (
        <CityMarker key={city.name} city={city} earthRadius={earthRadius} />
      ))}
    </group>
  );
}
