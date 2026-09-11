"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  EARTH_CLOUDS_TEXTURE,
  EARTH_NIGHT_TEXTURE,
  planets,
  type CelestialBody,
  type PlanetLayer,
} from "@/data/planets";
import { useStore } from "@/store/useStore";
import { simTimeRef } from "@/utils/simTime";
import AsteroidBelt from "./AsteroidBelt";
import EarthAtmosphere from "./EarthAtmosphere";
import EarthCountryBorders from "./EarthCountryBorders";
import EarthMarkers from "./EarthMarkers";
import ISS from "./ISS";
import MoonExplosion, { MoonDetonatePin } from "./MoonExplosion";
import PointOfInterest from "./PointOfInterest";

function useMaxAnisotropy() {
  return useThree((state) => state.gl.capabilities.getMaxAnisotropy());
}

function configureTexture(
  texture: THREE.Texture,
  colorSpace: THREE.ColorSpace,
  anisotropy: number,
) {
  texture.colorSpace = colorSpace;
  texture.anisotropy = anisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
}

function useSrgbTexture(path: string) {
  const texture = useTexture(path);
  configureTexture(texture, THREE.SRGBColorSpace, useMaxAnisotropy());
  return texture;
}

function OrbitPath({ body }: { body: CelestialBody }) {
  const hoveredPlanet = useStore((state) => state.hoveredPlanet);
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const isHighlighted = hoveredPlanet === body.name || focusedPlanet === body.name;

  const points = useMemo(() => {
    const a = body.distance;
    const b = a * Math.sqrt(1 - Math.pow(body.eccentricity, 2));
    const c = a * body.eccentricity;
    const curve = new THREE.EllipseCurve(c, 0, a, b, 0, Math.PI * 2, false, 0);
    const pts = curve.getPoints(128).map((p) => new THREE.Vector3(p.x, 0, p.y));
    if (pts[0]) pts.push(pts[0].clone());
    return pts;
  }, [body.distance, body.eccentricity]);

  if (body.distance <= 0) return null;

  return (
    <Line
      points={points}
      color={isHighlighted ? body.color : "#ffffff"}
      transparent
      opacity={isHighlighted ? 0.85 : 0.2}
      depthWrite={false}
      lineWidth={isHighlighted ? 1.5 : 1}
      raycast={() => {}}
    />
  );
}

function TexturedSphere({
  texturePath,
  radius,
}: {
  texturePath: string;
  radius: number;
}) {
  const texture = useSrgbTexture(texturePath);

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[radius, 128, 96]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} />
    </mesh>
  );
}

function ColoredSphere({ color, radius }: { color: string; radius: number }) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

function TexturedLayer({
  radius,
  texturePath,
  phiLength,
}: {
  radius: number;
  texturePath: string;
  phiLength: number;
}) {
  const texture = useSrgbTexture(texturePath);

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[radius, 64, 64, 0, phiLength]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function EarthCrust({
  radius,
  texturePath,
  clippingPlanes,
}: {
  radius: number;
  texturePath: string;
  clippingPlanes: THREE.Plane[];
}) {
  const anisotropy = useMaxAnisotropy();
  const [dayTexture, nightTexture] = useTexture([
    texturePath,
    EARTH_NIGHT_TEXTURE,
  ]);
  const normalTexture = useTexture("/textures/8k_earth_normal_map.jpg");
  const specularTexture = useTexture("/textures/8k_earth_specular_map.jpg");
  const normalScale = useMemo(() => new THREE.Vector2(2, 2), []);

  configureTexture(dayTexture, THREE.SRGBColorSpace, anisotropy);
  configureTexture(nightTexture, THREE.SRGBColorSpace, anisotropy);
  configureTexture(normalTexture, THREE.NoColorSpace, anisotropy);
  configureTexture(specularTexture, THREE.NoColorSpace, anisotropy);

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[radius, 192, 128]} />
      <meshStandardMaterial
        map={dayTexture}
        emissiveMap={nightTexture}
        emissive="#ffddaa"
        emissiveIntensity={2}
        toneMapped={false}
        normalMap={normalTexture}
        normalScale={normalScale}
        metalnessMap={specularTexture}
        metalness={1}
        roughness={0.2}
        clippingPlanes={clippingPlanes}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function ColoredLayer({
  radius,
  color,
  phiLength,
}: {
  radius: number;
  color: string;
  phiLength: number;
}) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[radius, 64, 64, 0, phiLength]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function EarthAnatomy({
  radius,
  texturePath,
}: {
  radius: number;
  texturePath: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(1, 0, 0), 1),
    [],
  );
  const localPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(1, 0, 0), 1),
    [],
  );

  useFrame(() => {
    localPlane.constant = 1 - useStore.getState().peelValue / 50;
    const group = groupRef.current;
    if (!group) {
      clipPlane.copy(localPlane);
      return;
    }
    group.updateWorldMatrix(true, false);
    clipPlane.copy(localPlane).applyMatrix4(group.matrixWorld);
  });

  return (
    <group ref={groupRef}>
      <EarthCrust
        radius={radius}
        texturePath={texturePath}
        clippingPlanes={[clipPlane]}
      />
      <EarthCountryBorders radius={radius} clippingPlanes={[clipPlane]} />
      <mesh>
        <sphereGeometry args={[radius * 0.85, 32, 32]} />
        <meshBasicMaterial color="#ff4400" />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 0.4, 32, 32]} />
        <meshBasicMaterial color="#ffcc55" />
      </mesh>
    </group>
  );
}

function AnatomyLayers({
  bodyName,
  layers,
}: {
  bodyName: string;
  layers: PlanetLayer[];
}) {
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const peelValue = useStore((state) => state.peelValue);
  const amount = focusedPlanet === bodyName ? peelValue : 0;
  const phiLength = Math.PI * 2 - (amount / 100) * Math.PI;
  const crustLayer = layers.find((layer) => layer.name === "Crust");
  const crustRadius = Math.max(...layers.map((layer) => layer.radius));

  if (bodyName === "Earth" && crustLayer?.texturePath) {
    return (
      <EarthAnatomy radius={crustLayer.radius} texturePath={crustLayer.texturePath} />
    );
  }

  return (
    <group>
      {layers.map((layer) =>
        layer.texturePath ? (
          <TexturedLayer
            key={layer.name}
            radius={layer.radius}
            texturePath={layer.texturePath}
            phiLength={phiLength}
          />
        ) : (
          <ColoredLayer
            key={layer.name}
            radius={layer.radius}
            color={layer.color ?? "#ffffff"}
            phiLength={phiLength}
          />
        ),
      )}
    </group>
  );
}

function BodyMesh({ body }: { body: CelestialBody }) {
  if (body.layers && body.layers.length > 0) {
    return (
      <Suspense fallback={null}>
        <AnatomyLayers bodyName={body.name} layers={body.layers} />
      </Suspense>
    );
  }

  if (body.texturePath) {
    return (
      <Suspense fallback={null}>
        <TexturedSphere texturePath={body.texturePath} radius={body.radius} />
      </Suspense>
    );
  }

  return <ColoredSphere color={body.color} radius={body.radius} />;
}

class RingsErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function PlanetRings({
  innerRadius,
  outerRadius,
  texturePath,
}: {
  innerRadius: number;
  outerRadius: number;
  texturePath: string;
}) {
  const ringTexture = useSrgbTexture(texturePath);
  ringTexture.wrapS = THREE.ClampToEdgeWrapping;
  ringTexture.wrapT = THREE.ClampToEdgeWrapping;

  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const positions = geo.attributes.position;
    const uvs = geo.attributes.uv;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const radius = Math.hypot(x, y);
      const u = (radius - innerRadius) / (outerRadius - innerRadius);
      uvs.setXY(i, u, 0.5);
    }

    uvs.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        map={ringTexture}
        transparent
        side={THREE.DoubleSide}
        alphaTest={0.05}
      />
    </mesh>
  );
}

const TEXTURE_OFFSET = 0;
const moonOrbitRef: { current: THREE.Group | null } = { current: null };

function getRealTimeRotation(timestamp: number) {
  const dateObj = new Date(timestamp);
  const hours =
    dateObj.getUTCHours() +
    dateObj.getUTCMinutes() / 60 +
    dateObj.getUTCSeconds() / 3600;
  const baseRotation = Math.PI * 2 - (hours / 24) * Math.PI * 2;
  return baseRotation + TEXTURE_OFFSET;
}

function SimulationClock() {
  const syncTimestamp = useStore((state) => state.syncTimestamp);

  useEffect(() => {
    simTimeRef.current = syncTimestamp;
  }, [syncTimestamp]);

  useFrame((_, delta) => {
    simTimeRef.current += delta * 1000 * useStore.getState().timeScale;

    const moonPeriodMs = 27.3 * 24 * 60 * 60 * 1000;
    if (moonOrbitRef.current) {
      moonOrbitRef.current.rotation.y =
        (simTimeRef.current / moonPeriodMs) * (Math.PI * 2);
    }
  });

  return null;
}

const moonTexturePath =
  planets.find((body) => body.name === "Earth")?.moons?.[0]?.texturePath ??
  "/textures/8k_moon.jpg";

function EarthMoon() {
  const moonTexture = useSrgbTexture(moonTexturePath);
  const explodeArmed = useStore((state) => state.explodeArmed);
  const moonExplosion = useStore((state) => state.moonExplosion);
  const intact = moonExplosion === null;

  return (
    <group rotation={[0, 0, 5.1 * (Math.PI / 180)]}>
      <group ref={moonOrbitRef}>
        <group position={[4, 0, 0]}>
          {intact && (
            <mesh
              name="Moon"
              castShadow
              receiveShadow
              onPointerOver={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                document.body.style.cursor = explodeArmed ? "crosshair" : "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
              onClick={(event: ThreeEvent<MouseEvent>) => {
                if (!useStore.getState().explodeArmed) return;
                event.stopPropagation();
                const origin = new THREE.Vector3();
                event.object.getWorldPosition(origin);
                useStore.getState().detonateMoon({
                  x: origin.x,
                  y: origin.y,
                  z: origin.z,
                });
              }}
            >
              <sphereGeometry args={[0.27, 48, 48]} />
              <meshStandardMaterial
                map={moonTexture}
                roughness={1}
                metalness={0}
                emissive={explodeArmed ? "#ff6a22" : "#000000"}
                emissiveIntensity={explodeArmed ? 0.35 : 0}
              />
            </mesh>
          )}
          <MoonDetonatePin />
        </group>
      </group>
    </group>
  );
}

function MoonBlast() {
  const moonExplosion = useStore((state) => state.moonExplosion);

  if (!moonExplosion) return null;

  return (
    <group position={[moonExplosion.x, moonExplosion.y, moonExplosion.z]}>
      <MoonExplosion key={moonExplosion.id} radius={0.27} />
    </group>
  );
}

function EarthOrientation({
  children,
  radius,
}: {
  children: React.ReactNode;
  radius: number;
}) {
  const cloudTexture = useTexture(EARTH_CLOUDS_TEXTURE);
  configureTexture(cloudTexture, THREE.NoColorSpace, useMaxAnisotropy());
  const showClouds = useStore((state) => state.showClouds);
  const earthMeshRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthMeshRef.current) {
      earthMeshRef.current.rotation.y = getRealTimeRotation(simTimeRef.current);
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y +=
        delta * 0.02 * useStore.getState().timeScale;
    }
  });

  return (
    <group>
      <group ref={earthMeshRef}>
        {children}
        <EarthAtmosphere radius={radius} />
      </group>
      <mesh ref={cloudsRef} castShadow visible={showClouds}>
        <sphereGeometry args={[radius * 1.01, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          alphaMap={cloudTexture}
          transparent
          opacity={0.8}
          depthWrite={false}
          alphaTest={0.15}
        />
      </mesh>
      <Suspense fallback={null}>
        <ISS />
      </Suspense>
    </group>
  );
}

function PlanetItem({
  body,
  children,
}: {
  body: CelestialBody;
  children?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const setFocusedPlanet = useStore((state) => state.setFocusedPlanet);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const showPlanetName =
    hovered &&
    selectedPlanet?.name !== body.name &&
    focusedPlanet !== body.name;
  const innerRadius =
    body.hasRings && body.ringInnerRadius !== undefined
      ? body.radius * body.ringInnerRadius
      : 0;
  const outerRadius =
    body.hasRings && body.ringOuterRadius !== undefined
      ? body.radius * body.ringOuterRadius
      : 0;

  const globe = (
    <>
      {children ?? <BodyMesh body={body} />}
      {body.name === "Earth" && (
        <EarthMarkers earthRadius={body.radius + 0.02} />
      )}
      {body.pois?.map((poi) => (
        <PointOfInterest
          key={poi.name}
          poi={poi}
          radius={body.radius}
          planetName={body.name}
        />
      ))}
    </>
  );

  return (
    <group
      name={body.name}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        setFocusedPlanet(body.name);
        useStore.getState().setSelectedPlanet(body);
      }}
    >
      <group rotation={[0, 0, body.axialTilt * (Math.PI / 180)]}>
        {body.name === "Earth" ? (
          <Suspense fallback={null}>
            <EarthOrientation radius={body.radius}>{globe}</EarthOrientation>
          </Suspense>
        ) : (
          globe
        )}
        {body.hasRings && body.ringTexturePath && (
          <RingsErrorBoundary>
            <Suspense fallback={null}>
              <PlanetRings
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                texturePath={body.ringTexturePath}
              />
            </Suspense>
          </RingsErrorBoundary>
        )}
      </group>
      {body.name === "Earth" && (
        <Suspense fallback={null}>
          <EarthMoon />
        </Suspense>
      )}
      {showPlanetName && (
        <Html center distanceFactor={15}>
          <div className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-md border border-white/20 pointer-events-none">
            {body.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function OrbitingBody({ body }: { body: CelestialBody }) {
  const groupRef = useRef<THREE.Group>(null);
  const a = body.distance;
  const b = a * Math.sqrt(1 - Math.pow(body.eccentricity, 2));
  const c = a * body.eccentricity;

  useFrame(() => {
    if (!groupRef.current || !body.orbitalPeriod) return;
    const periodMs = body.orbitalPeriod * 24 * 60 * 60 * 1000;
    const angle = (simTimeRef.current / periodMs) * (Math.PI * 2);
    const x = a * Math.cos(angle) + c;
    const z = b * Math.sin(angle);
    groupRef.current.position.set(x, 0, z);
  });

  return (
    <group ref={groupRef}>
      <PlanetItem body={body} />
      {body.name !== "Earth" &&
        body.moons?.map((moon) => (
          <OrbitingBody key={moon.name} body={moon} />
        ))}
    </group>
  );
}

function Sun({
  radius,
  texturePath,
}: {
  radius: number;
  texturePath: string;
}) {
  const sunTexture = useSrgbTexture(texturePath);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.002 * useStore.getState().timeScale;
  });

  return (
    <group>
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            map={sunTexture}
            emissiveMap={sunTexture}
            emissive="#ffaa33"
            emissiveIntensity={4}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[radius * 1.1, 32, 32]} />
          <meshBasicMaterial
            color="#ff5500"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[radius * 1.4, 32, 32]} />
          <meshBasicMaterial
            color="#ff2200"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      </group>
      <pointLight
        position={[0, 0, 0]}
        color="#fff4d6"
        intensity={1500}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
      />
    </group>
  );
}

export default function SolarSystem() {
  return (
    <group>
      <SimulationClock />
      <MoonBlast />
      <AsteroidBelt />
      {planets.map((body) =>
        body.name === "Sun" ? (
          <PlanetItem key={body.name} body={body}>
            <Suspense fallback={null}>
              <Sun
                radius={body.radius}
                texturePath={body.texturePath ?? "/textures/8k_sun.jpg"}
              />
            </Suspense>
          </PlanetItem>
        ) : (
          <group key={body.name}>
            <OrbitPath body={body} />
            <OrbitingBody body={body} />
          </group>
        ),
      )}
    </group>
  );
}
