"use client";

import { useMemo } from "react";
import * as THREE from "three";

const vertexShader = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec3 vNormal;
void main() {
  float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
  gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
}
`;

export default function EarthAtmosphere({ radius }: { radius: number }) {
  const material = useMemo(
    () => (
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    ),
    [],
  );

  return (
    <mesh raycast={() => {}}>
      <sphereGeometry args={[radius * 1.05, 64, 64]} />
      {material}
    </mesh>
  );
}
