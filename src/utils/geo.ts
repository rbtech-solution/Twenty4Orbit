import * as THREE from "three";

export function latLongToVector3(
  lat: number,
  lon: number,
  radius: number,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function vector3ToLatLon(point: THREE.Vector3): { lat: number; lon: number } {
  const radius = Math.max(point.length(), 1e-8);
  const lat =
    90 - (Math.acos(THREE.MathUtils.clamp(point.y / radius, -1, 1)) * 180) / Math.PI;
  const lon = (Math.atan2(point.z, -point.x) * 180) / Math.PI - 180;
  return { lat, lon };
}
