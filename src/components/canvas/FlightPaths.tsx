"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cities, flightPaths, type City } from "@/data/locations";
import { latLongToVector3 } from "@/utils/geo";

function AnimatedFlight({
  startCity,
  endCity,
  earthRadius,
}: {
  startCity: City;
  endCity: City;
  earthRadius: number;
}) {
  const dotRef = useRef<THREE.Mesh>(null);
  const progress = useRef(Math.random());

  const curve = useMemo(() => {
    const startVec = latLongToVector3(
      startCity.lat,
      startCity.lng,
      earthRadius,
    );
    const endVec = latLongToVector3(endCity.lat, endCity.lng, earthRadius);
    const distance = startVec.distanceTo(endVec);
    const midPoint = startVec.clone().lerp(endVec, 0.5);
    midPoint.normalize().multiplyScalar(earthRadius + distance * 0.25);
    return new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
  }, [earthRadius, endCity.lat, endCity.lng, startCity.lat, startCity.lng]);

  useFrame((_, delta) => {
    const dot = dotRef.current;
    if (!dot) return;

    progress.current += delta * 0.2;
    if (progress.current > 1) progress.current = 0;

    const currentPos = curve.getPointAt(progress.current);
    dot.position.copy(currentPos);
  });

  return (
    <group>
      <mesh raycast={() => {}}>
        <tubeGeometry args={[curve, 64, 0.005, 8, false]} />
        <meshBasicMaterial
          color={[0, 2, 1.5]}
          transparent
          opacity={0.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function FlightPaths({ earthRadius }: { earthRadius: number }) {
  return (
    <group>
      {flightPaths.map((path) => {
        const startCity = cities.find((city) => city.name === path.start);
        const endCity = cities.find((city) => city.name === path.end);
        if (!startCity || !endCity) return null;

        return (
          <AnimatedFlight
            key={`${path.start}-${path.end}`}
            startCity={startCity}
            endCity={endCity}
            earthRadius={earthRadius}
          />
        );
      })}
    </group>
  );
}
