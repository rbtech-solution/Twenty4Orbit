"use client";

import { useStore } from "@/store/useStore";

const TIME_PRESETS = [
  { label: "REAL TIME", value: 1 },
  { label: "1 HR / S", value: 3600 },
  { label: "10 HRS / S", value: 36000 },
  { label: "1 DAY / S", value: 86400 },
  { label: "1 WK / S", value: 604800 },
  { label: "1 MO / S", value: 2592000 },
  { label: "1 YR / S", value: 31557600 },
];

const buttonBase =
  "rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] whitespace-nowrap transition-all duration-300";
const buttonIdle =
  "border-transparent text-white/55 hover:border-white/20 hover:text-white";
const buttonActive =
  "border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.35)]";

export default function TimeController() {
  const timeScale = useStore((state) => state.timeScale);
  const triggerLiveSync = useStore((state) => state.triggerLiveSync);
  const isLive = timeScale === 1;
  const isPaused = timeScale === 0;

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 p-1.5 backdrop-blur-md">
      <button
        type="button"
        onClick={triggerLiveSync}
        className={`${buttonBase} ${
          isLive
            ? "border-emerald-400/70 bg-emerald-400/15 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.55)]"
            : buttonIdle
        }`}
      >
        Live Sync
      </button>
      <button
        type="button"
        onClick={() => useStore.getState().setTimeScale(0)}
        className={`${buttonBase} ${isPaused ? buttonActive : buttonIdle}`}
      >
        Pause
      </button>
      {TIME_PRESETS.map((preset) => {
        const isActive = timeScale === preset.value;
        return (
          <button
            key={preset.label}
            type="button"
            onClick={() => useStore.getState().setTimeScale(preset.value)}
            className={`${buttonBase} ${isActive ? buttonActive : buttonIdle}`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
