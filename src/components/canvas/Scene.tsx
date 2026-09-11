"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import SolarSystem from "./SolarSystem";
import Galaxies from "./Galaxies";
import CameraController from "./CameraController";
import { cameraControlsRef } from "./cameraControlsRef";
import { simTimeRef } from "@/utils/simTime";
import { useStore } from "@/store/useStore";

function SceneManager() {
  const { camera } = useThree();
  const introStarted = useStore((state) => state.introStarted);

  useEffect(() => {
    if (!introStarted) return;

    const controls = cameraControlsRef.current;
    if (!controls) return;

    camera.position.set(0, 48, 95);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [camera, introStarted]);

  return null;
}

function isWebGLFailure(reason: unknown) {
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === "string"
        ? reason
        : "";
  return /webgl/i.test(message);
}

function acquireWebGL2(canvas: HTMLCanvasElement) {
  return canvas.getContext("webgl2", {
    failIfMajorPerformanceCaveat: false,
    powerPreference: "default",
  });
}

function waitForUnmount() {
  return new Promise<THREE.WebGLRenderer>(() => {});
}

async function createSceneRenderer(
  defaultProps: THREE.WebGLRendererParameters,
  onUnavailable: () => void,
): Promise<THREE.WebGLRenderer> {
  const canvas = defaultProps.canvas;
  if (!canvas || !("getContext" in canvas)) {
    onUnavailable();
    return waitForUnmount();
  }

  const context = acquireWebGL2(canvas as HTMLCanvasElement);
  if (!context) {
    onUnavailable();
    return waitForUnmount();
  }

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      antialias: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "default",
      stencil: false,
    });
    renderer.localClippingEnabled = true;
    return renderer;
  } catch {
    onUnavailable();
    return waitForUnmount();
  }
}

function WebGLLifecycle({ onFatal }: { onFatal: () => void }) {
  const gl = useThree((state) => state.gl);
  const onFatalRef = useRef(onFatal);
  onFatalRef.current = onFatal;

  useEffect(() => {
    let unmounting = false;
    const canvas = gl.domElement;

    const onLost = (event: Event) => {
      event.preventDefault();
      if (!unmounting) onFatalRef.current();
    };

    canvas.addEventListener("webglcontextlost", onLost, false);
    return () => {
      unmounting = true;
      canvas.removeEventListener("webglcontextlost", onLost, false);
      gl.dispose();
      gl.forceContextLoss();
    };
  }, [gl]);

  return null;
}

function WebGLFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black px-8 text-center text-white">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">Renderer</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">
        WebGL could not start
      </h2>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60">
        Chrome is out of GPU slots. Close the other 3D tabs in this window
        (solar-system demos, texture previews), then click Retry. If it still
        fails, restart Chrome with hardware acceleration on at{" "}
        <span className="text-white">chrome://settings/system</span>.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 rounded-full border border-white/30 px-8 py-2 text-xs uppercase tracking-[0.25em] transition-colors hover:border-white hover:bg-white/10"
      >
        Retry
      </button>
    </div>
  );
}

export default function Scene() {
  const setFocusedPlanet = useStore((state) => state.setFocusedPlanet);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);
  const [canvasKey, setCanvasKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) setReady(true);
      });
    });

    const onReject = (event: PromiseRejectionEvent) => {
      if (!isWebGLFailure(event.reason)) return;
      event.preventDefault();
      setFailed(true);
    };

    window.addEventListener("unhandledrejection", onReject);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("unhandledrejection", onReject);
    };
  }, [canvasKey]);

  const retry = () => {
    setFailed(false);
    setReady(false);
    setCanvasKey((key) => key + 1);
  };

  if (failed) {
    return <WebGLFallback onRetry={retry} />;
  }

  if (!ready) {
    return <div className="h-full w-full bg-black" />;
  }

  return (
    <div className="h-full w-full bg-black">
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 2, 250], fov: 45 }}
        shadows
        dpr={[1, 1.25]}
        gl={(defaultProps) =>
          createSceneRenderer(defaultProps, () => setFailed(true))
        }
        onPointerMissed={() => {
          setFocusedPlanet(null);
          setSelectedPlanet(null);
        }}
      >
        <WebGLLifecycle onFatal={() => setFailed(true)} />
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.05} />

        <Stars
          count={10000}
          depth={100}
          factor={6}
          fade
          radius={300}
          saturation={0}
          speed={1}
        />
        <Galaxies />

        <SolarSystem />
        <OrbitControls
          makeDefault
          ref={cameraControlsRef}
          enableDamping
          dampingFactor={0.08}
          minDistance={0.08}
          maxDistance={400}
        />
        <CameraController
          controlsRef={cameraControlsRef}
          simTimeRef={simTimeRef}
        />
        <SceneManager />

        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={1} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
