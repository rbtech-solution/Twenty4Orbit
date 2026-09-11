"use client";

import Scene from "@/components/canvas/Scene";
import CityDataCard from "@/components/ui/CityDataCard";
import CountryDataCard from "@/components/ui/CountryDataCard";
import DataCard from "@/components/ui/DataCard";
import PlanetInfoCard from "@/components/ui/PlanetInfoCard";
import PlanetMenu from "@/components/ui/PlanetMenu";
import TimeController from "@/components/ui/TimeController";
import { useStore } from "@/store/useStore";

export default function Home() {
  const focusedPlanet = useStore((state) => state.focusedPlanet);
  const focusedCity = useStore((state) => state.focusedCity);
  const selectedCountry = useStore((state) => state.selectedCountry);
  const introStarted = useStore((state) => state.introStarted);
  const setFocusedPlanet = useStore((state) => state.setFocusedPlanet);
  const setIntroStarted = useStore((state) => state.setIntroStarted);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        {introStarted && focusedPlanet !== null && (
          <button
            type="button"
            onClick={() => setFocusedPlanet(null)}
            className="pointer-events-auto absolute top-8 left-8 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm tracking-wide text-white backdrop-blur hover:bg-white/10"
          >
            Back to Solar System
          </button>
        )}

        {introStarted && <PlanetMenu />}
        {introStarted && <TimeController />}
        <div className="pointer-events-none absolute top-10 right-10 z-50 flex max-h-[90vh] flex-col gap-6 overflow-y-auto">
          <PlanetInfoCard />
          {focusedCity ? (
            <CityDataCard />
          ) : selectedCountry ? (
            <CountryDataCard />
          ) : (
            <DataCard />
          )}
        </div>

        {introStarted && (
          <div className="absolute bottom-24 left-0 p-10">
            <h1 className="mb-4 text-6xl font-bold tracking-tighter">
              Planetary Anatomy
            </h1>
            <p className="max-w-md text-xl text-gray-400">
              Scroll to peel away the layers and explore the core.
            </p>
          </div>
        )}

        {!introStarted && (
          <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
            <p className="mb-3 text-xs uppercase tracking-[0.5em] text-white/50">
              A journey through
            </p>
            <h1 className="text-center text-5xl font-bold tracking-[0.35em] sm:text-6xl">
              PLANETARY ANATOMY
            </h1>
            <button
              type="button"
              onClick={() => setIntroStarted(true)}
              className="mt-12 rounded-full border border-white/30 px-10 py-3 text-xs font-medium uppercase tracking-[0.35em] text-white transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              Begin Journey
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
