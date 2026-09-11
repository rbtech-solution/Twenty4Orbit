"use client";

import { useEffect, useState } from "react";
import { planets, type CelestialBody, type PlanetLayer } from "@/data/planets";
import { useStore } from "@/store/useStore";

function findBody(name: string): CelestialBody | undefined {
  for (const body of planets) {
    if (body.name === name) return body;
    const moon = body.moons?.find((item) => item.name === name);
    if (moon) return moon;
  }
  return undefined;
}

function getActiveLayer(layers: PlanetLayer[], peelAmount: number): PlanetLayer {
  const outerToInner = [...layers].sort((a, b) => b.radius - a.radius);
  const segmentCount = outerToInner.length;
  const clamped = Math.min(100, Math.max(0, peelAmount));
  const index = Math.min(
    segmentCount - 1,
    Math.floor((clamped / 100) * segmentCount),
  );

  return outerToInner[index];
}

const PLACEHOLDER_FACTS: Record<string, string[]> = {
  Sun: ["G-type main-sequence star", "Source of light and heat for the system"],
  Mercury: ["Closest planet to the Sun", "No substantial atmosphere"],
  Venus: ["Hottest planet in the solar system", "Thick carbon dioxide clouds"],
  Earth: ["The only known world with life", "Liquid water covers most of the surface"],
  Moon: ["Earth's only natural satellite", "Tidally locked to Earth"],
  Mars: ["A cold desert world", "Home to the largest volcano in the system"],
  Jupiter: ["The largest planet", "A gas giant with a fierce storm system"],
  Saturn: ["Famous for its ring system", "Less dense than water"],
  Uranus: ["An ice giant on its side", "Pale cyan atmosphere"],
  Neptune: ["The farthest planet from the Sun", "Supersonic winds"],
};

function LayerDetails({ layer }: { layer: PlanetLayer }) {
  const [visible, setVisible] = useState(true);
  const [displayed, setDisplayed] = useState(layer);

  useEffect(() => {
    if (layer.name === displayed.name) return;

    setVisible(false);
    const timeout = window.setTimeout(() => {
      setDisplayed(layer);
      setVisible(true);
    }, 160);

    return () => window.clearTimeout(timeout);
  }, [displayed.name, layer]);

  return (
    <div
      className={`mt-5 transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
        Exposed layer
      </p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight">
        {displayed.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">
        {displayed.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Depth
          </p>
          <p className="mt-1 text-lg font-medium tracking-tight text-white">
            {displayed.depth}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Temp
          </p>
          <p className="mt-1 text-lg font-medium tracking-tight text-white">
            {displayed.temperature}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DataCard() {
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const peelValue = useStore((state) => state.peelValue);
  const setPeelValue = useStore((state) => state.setPeelValue);

  if (focusedPlanet === null) return null;

  const planet = findBody(focusedPlanet);
  const facts = PLACEHOLDER_FACTS[focusedPlanet] ?? [
    "Observational data pending",
    "Interior structure unknown",
  ];
  const layers = planet?.layers ?? [];
  const activeLayer = layers.length > 0 ? getActiveLayer(layers, peelValue) : null;

  return (
    <aside className="pointer-events-auto w-80 rounded-2xl border border-white/20 bg-black/50 p-6 text-white shadow-2xl backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Dossier</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight">{focusedPlanet}</h2>

      <ul className="mt-4 space-y-2 text-sm text-white/70">
        {facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>

      {activeLayer && <LayerDetails layer={activeLayer} />}

      {layers.length > 0 && (
        <label className="mt-6 block">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Peel</span>
            <span className="text-white/50">{peelValue}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={peelValue}
            onChange={(event) => setPeelValue(Number(event.target.value))}
            className="w-full accent-white"
          />
        </label>
      )}
    </aside>
  );
}
