import { create } from "zustand";
import type { CelestialBody } from "@/data/planets";
import type { CountryInfo } from "@/data/countries";

type AppState = {
  focusedPlanet: string | null;
  hoveredPlanet: string | null;
  selectedPlanet: CelestialBody | null;
  peelAmount: number;
  peelValue: number;
  timeScale: number;
  syncTimestamp: number;
  introStarted: boolean;
  focusedCity: string | null;
  selectedCountry: CountryInfo | null;
  showClouds: boolean;
  showBorders: boolean;
  explodeArmed: boolean;
  moonExplosion: { x: number; y: number; z: number; id: number } | null;
  setFocusedPlanet: (planet: string | null) => void;
  setHoveredPlanet: (planet: string | null) => void;
  setSelectedPlanet: (planet: CelestialBody | null) => void;
  setPeelAmount: (amount: number) => void;
  setPeelValue: (val: number) => void;
  setTimeScale: (scale: number) => void;
  triggerLiveSync: () => void;
  setIntroStarted: (val: boolean) => void;
  setFocusedCity: (city: string | null) => void;
  setSelectedCountry: (country: CountryInfo | null) => void;
  setShowClouds: (val: boolean) => void;
  setShowBorders: (val: boolean) => void;
  setExplodeArmed: (val: boolean) => void;
  detonateMoon: (origin: { x: number; y: number; z: number }) => void;
  restoreMoon: () => void;
};

export const useStore = create<AppState>((set) => ({
  focusedPlanet: null,
  hoveredPlanet: null,
  selectedPlanet: null,
  peelAmount: 0,
  peelValue: 0,
  timeScale: 1,
  syncTimestamp: Date.now(),
  introStarted: false,
  focusedCity: null,
  selectedCountry: null,
  showClouds: true,
  showBorders: true,
  explodeArmed: false,
  moonExplosion: null,
  setFocusedPlanet: (planet) =>
    set((state) => ({
      focusedPlanet: planet,
      focusedCity: null,
      selectedCountry: planet === "Earth" ? state.selectedCountry : null,
      selectedPlanet: planet === null ? null : state.selectedPlanet,
      peelAmount:
        planet === null || planet !== state.focusedPlanet ? 0 : state.peelAmount,
      peelValue:
        planet === null || planet !== state.focusedPlanet ? 0 : state.peelValue,
    })),
  setHoveredPlanet: (planet) => set({ hoveredPlanet: planet }),
  setSelectedPlanet: (planet) =>
    set((state) => ({
      selectedPlanet: planet,
      selectedCountry:
        planet === null || planet.name === "Earth"
          ? state.selectedCountry
          : null,
    })),
  setPeelAmount: (amount) => set({ peelAmount: amount, peelValue: amount }),
  setPeelValue: (val) => set({ peelValue: val, peelAmount: val }),
  setTimeScale: (scale) => set({ timeScale: scale }),
  triggerLiveSync: () => set({ syncTimestamp: Date.now(), timeScale: 1 }),
  setIntroStarted: (val) => set({ introStarted: val }),
  setFocusedCity: (city) =>
    set({
      focusedCity: city,
      ...(city ? { focusedPlanet: "Earth" as const, selectedCountry: null } : {}),
    }),
  setSelectedCountry: (country) =>
    set({
      selectedCountry: country,
      ...(country ? { focusedCity: null } : {}),
    }),
  setShowClouds: (val) => set({ showClouds: val }),
  setShowBorders: (val) =>
    set({
      showBorders: val,
      ...(val ? {} : { selectedCountry: null }),
    }),
  setExplodeArmed: (val) => set({ explodeArmed: val }),
  detonateMoon: (origin) =>
    set((state) => {
      if (!state.explodeArmed || state.moonExplosion) return state;
      return {
        moonExplosion: { ...origin, id: Date.now() },
        explodeArmed: false,
      };
    }),
  restoreMoon: () => set({ moonExplosion: null, explodeArmed: false }),
}));
