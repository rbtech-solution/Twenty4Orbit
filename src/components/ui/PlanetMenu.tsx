"use client";

import { planets } from "@/data/planets";
import { useStore } from "@/store/useStore";

export default function PlanetMenu() {
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const setFocusedPlanet = useStore((state) => state.setFocusedPlanet);
  const setHoveredPlanet = useStore((state) => state.setHoveredPlanet);

  return (
    <nav className="pointer-events-auto absolute top-1/2 left-6 flex -translate-y-1/2 flex-col gap-2 rounded-r-xl border-r border-white/10 bg-black/40 p-4 backdrop-blur-md">
      {planets.map((planet) => {
        const isActive = focusedPlanet === planet.name;

        return (
          <button
            key={planet.name}
            type="button"
            onClick={() => {
              setFocusedPlanet(planet.name);
              useStore.getState().setSelectedPlanet(planet);
            }}
            onMouseEnter={() => setHoveredPlanet(planet.name)}
            onMouseLeave={() => setHoveredPlanet(null)}
            className={`flex items-center gap-3 px-4 py-2 text-left uppercase tracking-[0.2em] text-xs font-medium transition-all duration-300 hover:translate-x-2 ${
              isActive
                ? "border-l-2 border-white bg-gradient-to-r from-white/20 to-transparent text-white"
                : "border-l-2 border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <div
              className="h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              style={{ backgroundColor: planet.color }}
            />
            {planet.name}
          </button>
        );
      })}
    </nav>
  );
}
