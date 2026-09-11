"use client";

import { cities } from "@/data/locations";
import { useStore } from "@/store/useStore";

export default function CityDataCard() {
  const focusedCity = useStore((state) => state.focusedCity);
  const setFocusedCity = useStore((state) => state.setFocusedCity);

  if (focusedCity === null) return null;

  const city = cities.find((item) => item.name === focusedCity);
  if (!city) return null;

  return (
    <aside className="pointer-events-auto w-full rounded-xl border border-white/20 bg-black/50 p-4 text-white shadow-2xl backdrop-blur-lg md:p-6">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
        Surface site
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight">{city.name}</h2>
      <p className="mt-1 text-sm text-white/60">{city.country}</p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Population
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">
            {city.population}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Weather
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">
            {city.weather}
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-white/70">
        {city.description}
      </p>

      <button
        type="button"
        onClick={() => setFocusedCity(null)}
        className="mt-6 w-full rounded-full border border-white/20 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-white/50 hover:text-white"
      >
        Back to Globe
      </button>
    </aside>
  );
}
