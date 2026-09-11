"use client";

import { planets } from "@/data/planets";
import { useStore } from "@/store/useStore";

export default function PlanetMenu() {
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const setFocusedPlanet = useStore((state) => state.setFocusedPlanet);
  const setHoveredPlanet = useStore((state) => state.setHoveredPlanet);

  return (
    <nav className="pointer-events-auto absolute top-1/2 left-2 z-40 flex max-h-[45vh] -translate-y-1/2 flex-col gap-1 overflow-y-auto rounded-r-xl border-r border-white/10 bg-black/40 p-2 backdrop-blur-md md:left-6 md:max-h-none md:gap-2 md:p-4">
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
            className={`flex items-center gap-2 px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:translate-x-2 md:gap-3 md:px-4 md:py-2 md:text-xs ${
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
