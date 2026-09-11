"use client";

import { useStore } from "@/store/useStore";

function formatOrbitalPeriod(days?: number) {
  if (days === undefined) return "—";
  if (days >= 365) {
    const years = days / 365.25;
    return `${days.toLocaleString()} days (${years.toFixed(2)} yr)`;
  }
  return `${days} days`;
}

function LayerToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left transition-colors hover:border-cyan-500/30 hover:bg-white/[0.08]"
    >
      <span className="text-sm text-white/85 md:text-base">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-cyan-400" : "bg-white/20"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

export default function PlanetInfoCard() {
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);
  const showClouds = useStore((state) => state.showClouds);
  const showBorders = useStore((state) => state.showBorders);
  const setShowClouds = useStore((state) => state.setShowClouds);
  const setShowBorders = useStore((state) => state.setShowBorders);

  if (selectedPlanet === null) return null;

  const stats = [
    { label: "Speed", value: selectedPlanet.orbitalSpeed ?? "—" },
    { label: "Atmosphere", value: selectedPlanet.atmosphere ?? "—" },
    { label: "Orbital Period", value: formatOrbitalPeriod(selectedPlanet.orbitalPeriod) },
  ];

  return (
    <div className="pointer-events-auto w-full rounded-xl border border-cyan-500/30 bg-black/60 p-4 text-white shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-md md:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-400/70">
            Target lock
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-3xl">
            {selectedPlanet.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setSelectedPlanet(null)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-sm text-white/60 transition-colors hover:border-white/40 hover:text-white"
          aria-label="Close planet data"
        >
          X
        </button>
      </div>

      {selectedPlanet.description && (
        <p className="mb-5 text-sm leading-relaxed text-white/65 md:text-base">
          {selectedPlanet.description}
        </p>
      )}

      <dl className="space-y-3 border-t border-white/10 pt-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/60">
              {stat.label}
            </dt>
            <dd className="mt-1 text-sm text-white/90 md:text-base">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {selectedPlanet.name === "Earth" && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-cyan-400/70">
            Layers
          </p>
          <div className="space-y-2">
            <LayerToggle
              label="Atmospheric Clouds"
              checked={showClouds}
              onChange={setShowClouds}
            />
            <LayerToggle
              label="Geopolitical Borders"
              checked={showBorders}
              onChange={setShowBorders}
            />
            <p className="px-1 text-[10px] leading-relaxed text-white/40">
              Scroll to zoom, then click a country for its dossier.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
