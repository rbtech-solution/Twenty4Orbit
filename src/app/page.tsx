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
            className="pointer-events-auto absolute top-28 left-4 z-[60] rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs tracking-wide text-white backdrop-blur hover:bg-white/10 md:top-8 md:left-8 md:px-4 md:py-2 md:text-sm"
          >
            Back to Solar System
          </button>
        )}

        {introStarted && <PlanetMenu />}
        {introStarted && (
          <div className="absolute bottom-4 left-1/2 z-50 flex w-max max-w-[90vw] -translate-x-1/2 items-center gap-2 overflow-x-auto overflow-y-hidden pointer-events-auto scrollbar-hide md:bottom-10 md:gap-4">
            <TimeController />
          </div>
        )}
        <div className="pointer-events-none absolute top-4 right-4 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-sm flex-col gap-4 overflow-y-auto md:top-10 md:right-10 md:w-auto md:gap-6">
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
          <div className="pointer-events-none absolute top-4 left-4 z-50 md:top-10 md:left-10">
            <h1 className="mb-2 text-2xl font-bold tracking-tighter md:mb-4 md:text-4xl">
              Twenty4Orbit
            </h1>
            <p className="max-w-md text-sm text-gray-400 md:text-xl">
              Explore the solar system with real-time Keplerian physics and
              volumetric rendering.
            </p>
          </div>
        )}

        {!introStarted && (
          <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
            <p className="mb-3 text-xs uppercase tracking-[0.5em] text-white/50">
              A journey through
            </p>
            <h1 className="px-4 text-center text-3xl font-bold tracking-[0.2em] sm:text-5xl sm:tracking-[0.35em] md:text-6xl">
              TWENTY4ORBIT
            </h1>
            <button
              type="button"
              onClick={() => setIntroStarted(true)}
              className="mt-12 rounded-full border border-white/30 px-8 py-3 text-xs font-medium uppercase tracking-[0.35em] text-white transition-all duration-300 hover:border-white hover:bg-white/10 sm:px-10"
            >
              Begin Journey
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
