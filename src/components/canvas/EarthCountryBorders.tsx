"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  formatGdp,
  formatPopulation,
  type CountryInfo,
} from "@/data/countries";
import { EUROPE_COUNTRIES } from "@/data/europeCountries";
import { latLongToVector3, vector3ToLatLon } from "@/utils/geo";
import { useStore } from "@/store/useStore";

type Ring = number[][];

type CountryFeature = {
  name: string;
  rings: Ring[];
  lat: number;
  lon: number;
  area: number;
  european: boolean;
  info: CountryInfo;
};

const GEOJSON_URLS = [
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson",
  "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson",
];

function asText(value: unknown, fallback = "—") {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  return value.replace(/^\d+\.\s*/, "");
}

function countryName(properties: Record<string, unknown> | null) {
  if (!properties) return "Country";
  return asText(
    properties.NAME || properties.ADMIN || properties.name || properties.NAME_EN,
    "Country",
  );
}

function toCountryInfo(properties: Record<string, unknown> | null): CountryInfo {
  const name = countryName(properties);
  return {
    name,
    officialName: asText(properties?.NAME_LONG || properties?.ADMIN, name),
    iso: asText(properties?.ISO_A3 || properties?.ADM0_A3, "—"),
    continent: asText(properties?.CONTINENT),
    subregion: asText(properties?.SUBREGION || properties?.REGION_WB),
    population: formatPopulation(properties?.POP_EST),
    gdp: formatGdp(properties?.GDP_MD || properties?.GDP_MD_EST),
    economy: asText(properties?.ECONOMY),
    income: asText(properties?.INCOME_GRP),
  };
}

function ringsFromGeometry(geometry: {
  type: string;
  coordinates: unknown;
}): Ring[] {
  if (geometry.type === "Polygon") {
    return (geometry.coordinates as Ring[]).slice(0, 1);
  }
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as Ring[][]).map((polygon) => polygon[0]);
  }
  return [];
}

function ringArea(ring: Ring) {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area);
}

function ringCentroid(ring: Ring) {
  let lon = 0;
  let lat = 0;
  const count = Math.max(1, ring.length);
  for (const point of ring) {
    lon += point[0];
    lat += point[1];
  }
  return { lon: lon / count, lat: lat / count };
}

function pointInRing(lon: number, lat: number, ring: Ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function markerRing(lat: number, lon: number, size: number): Ring {
  const points: Ring = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    points.push([
      lon + Math.cos(angle) * size,
      lat + Math.sin(angle) * size * 0.7,
    ]);
  }
  return points;
}

function angularDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dLat = p2 - p1;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  return (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 180) / Math.PI;
}

function mergeEuropeanCountries(world: CountryFeature[]): CountryFeature[] {
  const merged = [...world];

  for (const seed of EUROPE_COUNTRIES) {
    const aliases = new Set(seed.aliases.map((alias) => alias.toLowerCase()));
    const existing = merged.find(
      (country) =>
        country.info.iso === seed.iso ||
        aliases.has(country.name.toLowerCase()),
    );
    const info = { ...seed.info, capital: seed.capital };

    if (existing) {
      existing.name = seed.name;
      existing.european = true;
      existing.info = { ...existing.info, ...info };
      continue;
    }

    merged.push({
      name: seed.name,
      rings: [markerRing(seed.lat, seed.lon, seed.hitSize)],
      lat: seed.lat,
      lon: seed.lon,
      area: seed.hitSize * seed.hitSize,
      european: true,
      info,
    });
  }

  return merged.sort((a, b) => b.area - a.area);
}

function labelsForView(
  countries: CountryFeature[],
  lookLat: number,
  lookLon: number,
  band: number,
) {
  if (band === 0) return [];

  const nearby = (maxDegrees: number, european: boolean) =>
    countries.filter(
      (country) =>
        country.european === european &&
        angularDistance(lookLat, lookLon, country.lat, country.lon) < maxDegrees,
    );

  if (band === 1) {
    const europe = nearby(32, true);
    const rest = nearby(28, false).slice(0, 10);
    return uniqueCountries([...europe, ...rest]);
  }

  return uniqueCountries([...nearby(34, true), ...nearby(16, false)]);
}

function uniqueCountries(countries: CountryFeature[]) {
  const seen = new Set<string>();
  return countries.filter((country) => {
    if (seen.has(country.name)) return false;
    seen.add(country.name);
    return true;
  });
}

function findCountry(lat: number, lon: number, countries: CountryFeature[]) {
  const smallestFirst = [...countries].sort((a, b) => a.area - b.area);
  return (
    smallestFirst.find((country) =>
      country.rings.some((ring) => pointInRing(lon, lat, ring)),
    ) ?? null
  );
}

async function loadCountries(): Promise<CountryFeature[]> {
  for (const url of GEOJSON_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const geojson = (await response.json()) as {
        features: {
          properties: Record<string, unknown> | null;
          geometry: { type: string; coordinates: unknown };
        }[];
      };
      return mergeEuropeanCountries(
        geojson.features
        .map((feature) => {
          const rings = ringsFromGeometry(feature.geometry).filter(
            (ring) => ring.length > 2,
          );
          if (rings.length === 0) return null;
          const largest = rings.reduce((best, ring) =>
            ringArea(ring) > ringArea(best) ? ring : best,
          );
          const { lat, lon } = ringCentroid(largest);
          return {
            name: countryName(feature.properties),
            rings,
            lat,
            lon,
            area: ringArea(largest),
            european: false,
            info: toCountryInfo(feature.properties),
          };
        })
        .filter((feature): feature is CountryFeature => feature !== null)
        .sort((a, b) => b.area - a.area),
      );
    } catch {
      continue;
    }
  }
  return mergeEuropeanCountries([]);
}

function buildBorderGeometry(countries: CountryFeature[], radius: number) {
  const positions: number[] = [];
  const point = new THREE.Vector3();
  const next = new THREE.Vector3();

  for (const country of countries) {
    for (const ring of country.rings) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [lonA, latA] = ring[i];
        const [lonB, latB] = ring[i + 1];
        if (Math.abs(lonA - lonB) > 180 || Math.abs(latA - latB) > 90) {
          continue;
        }
        point.copy(latLongToVector3(latA, lonA, radius));
        next.copy(latLongToVector3(latB, lonB, radius));
        positions.push(point.x, point.y, point.z, next.x, next.y, next.z);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  return geometry;
}

export default function EarthCountryBorders({
  radius,
  clippingPlanes,
}: {
  radius: number;
  clippingPlanes: THREE.Plane[];
}) {
  const showBorders = useStore((state) => state.showBorders);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const selectedCountry = useStore((state) => state.selectedCountry);
  const setSelectedCountry = useStore((state) => state.setSelectedCountry);
  const earthSelected =
    selectedPlanet?.name === "Earth" || focusedPlanet === "Earth";
  const visible = showBorders && earthSelected;

  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [zoomBand, setZoomBand] = useState(0);
  const [look, setLook] = useState({ lat: 50, lon: 10 });
  const zoomBandRef = useRef(0);
  const lookRef = useRef({ lat: 999, lon: 999 });
  const groupRef = useRef<THREE.Group>(null);
  const countriesRef = useRef<CountryFeature[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadCountries()
      .then((features) => {
        if (cancelled) return;
        setCountries(features);
        countriesRef.current = features;
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = mergeEuropeanCountries([]);
        setCountries(fallback);
        countriesRef.current = fallback;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const geometry = useMemo(() => {
    if (countries.length === 0) return null;
    return buildBorderGeometry(countries, radius * 1.003);
  }, [countries, radius]);

  const selectedFeature = countries.find(
    (country) => country.name === selectedCountry?.name,
  );
  const highlightGeometry = useMemo(() => {
    if (!selectedFeature) return null;
    return buildBorderGeometry([selectedFeature], radius * 1.006);
  }, [selectedFeature, radius]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
      highlightGeometry?.dispose();
    };
  }, [geometry, highlightGeometry]);

  useFrame(({ camera }) => {
    const group = groupRef.current;
    if (!group || !visible) return;

    const center = new THREE.Vector3();
    group.getWorldPosition(center);
    const altitude = camera.position.distanceTo(center) - radius;
    const band = altitude > 2.4 ? 0 : altitude > 1.05 ? 1 : 2;
    const localCam = group.worldToLocal(camera.position.clone());
    const coords = vector3ToLatLon(localCam);
    const latKey = Math.round(coords.lat);
    const lonKey = Math.round(coords.lon);
    if (
      band !== zoomBandRef.current ||
      latKey !== lookRef.current.lat ||
      lonKey !== lookRef.current.lon
    ) {
      zoomBandRef.current = band;
      lookRef.current = { lat: latKey, lon: lonKey };
      setZoomBand(band);
      setLook({ lat: coords.lat, lon: coords.lon });
    }
  });

  const pickCountry = (event: { point: THREE.Vector3 }) => {
    const group = groupRef.current;
    if (!group) return null;
    const local = group.worldToLocal(event.point.clone());
    const { lat, lon } = vector3ToLatLon(local);
    return findCountry(lat, lon, countriesRef.current);
  };

  const onCountryClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const country = pickCountry(event);
    setSelectedCountry(country ? country.info : null);
  };

  const onCountryMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const country = pickCountry(event);
    const name = country?.name ?? null;
    if (name !== hoveredCountry) setHoveredCountry(name);
    document.body.style.cursor = name ? "pointer" : "auto";
  };

  const labels = labelsForView(countries, look.lat, look.lon, zoomBand);

  if (!visible || !geometry) return null;

  return (
    <group ref={groupRef}>
      <mesh
        onClick={onCountryClick}
        onPointerMove={onCountryMove}
        onPointerOut={() => {
          setHoveredCountry(null);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[radius * 1.004, 64, 64]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={geometry} raycast={() => {}}>
        <lineBasicMaterial
          color="#7ee7ff"
          transparent
          opacity={zoomBand === 2 ? 0.9 : 0.55}
          depthWrite={false}
          clippingPlanes={clippingPlanes}
        />
      </lineSegments>
      {highlightGeometry && (
        <lineSegments geometry={highlightGeometry} raycast={() => {}}>
          <lineBasicMaterial
            color="#ffffff"
            transparent
            opacity={1}
            depthWrite={false}
            clippingPlanes={clippingPlanes}
          />
        </lineSegments>
      )}
      {labels.map((country) => {
        const active =
          country.name === selectedCountry?.name ||
          country.name === hoveredCountry;
        return (
          <group
            key={`${country.name}-${country.lat.toFixed(2)}-${country.lon.toFixed(2)}`}
            position={latLongToVector3(country.lat, country.lon, radius * 1.01)}
          >
            <Html center sprite occlude={false}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedCountry(country.info);
                }}
                className={`pointer-events-auto whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[9px] font-medium tracking-wide backdrop-blur-sm transition-colors ${
                  active
                    ? "bg-cyan-400/30 text-white"
                    : "bg-black/45 text-cyan-100/90 hover:bg-cyan-400/20 hover:text-white"
                }`}
              >
                {country.name}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
