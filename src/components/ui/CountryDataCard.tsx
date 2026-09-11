"use client";

import { useStore } from "@/store/useStore";

export default function CountryDataCard() {
  const selectedCountry = useStore((state) => state.selectedCountry);
  const setSelectedCountry = useStore((state) => state.setSelectedCountry);

  if (selectedCountry === null) return null;

  const stats = [
    { label: "Continent", value: selectedCountry.continent },
    { label: "Region", value: selectedCountry.subregion },
    { label: "Population", value: selectedCountry.population },
    { label: "GDP", value: selectedCountry.gdp },
    { label: "Economy", value: selectedCountry.economy },
    { label: "Income", value: selectedCountry.income },
  ];

  return (
    <aside className="pointer-events-auto w-80 rounded-xl border border-cyan-500/25 bg-black/55 p-6 text-white shadow-[0_0_40px_rgba(34,211,238,0.1)] backdrop-blur-lg">
      <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400/70">
        Country dossier
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight">
        {selectedCountry.name}
      </h2>
      {selectedCountry.officialName !== selectedCountry.name && (
        <p className="mt-1 text-sm text-white/55">{selectedCountry.officialName}</p>
      )}
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/40">
        {selectedCountry.iso}
      </p>
      {selectedCountry.capital && (
        <p className="mt-3 text-sm text-white/70">
          Capital{" "}
          <span className="text-white">{selectedCountry.capital}</span>
        </p>
      )}

      <dl className="mt-5 space-y-3 border-t border-white/10 pt-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-start justify-between gap-4">
            <dt className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/60">
              {stat.label}
            </dt>
            <dd className="text-right text-sm text-white/90">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={() => setSelectedCountry(null)}
        className="mt-6 w-full rounded-full border border-white/20 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-white/50 hover:text-white"
      >
        Close dossier
      </button>
    </aside>
  );
}
