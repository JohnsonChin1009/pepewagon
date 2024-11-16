"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Define interfaces that extend the library's types
interface GlobeState extends Record<string, number> {
  phi: number;
  width: number;
  height: number;
  dark: number;
}

interface GlobeProps {
  className?: string;
  config?: Partial<COBEOptions>;
}

// Type for the globe instance
interface GlobeInstance {
  destroy: () => void;
  updateWidth: (width: number) => void;
}

const DEFAULT_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 }, // Manila
    { location: [19.076, 72.8777], size: 0.1 },    // Mumbai
    { location: [23.8103, 90.4125], size: 0.05 },  // Dhaka
    { location: [30.0444, 31.2357], size: 0.07 },  // Cairo
    { location: [39.9042, 116.4074], size: 0.08 }, // Beijing
    { location: [-23.5505, -46.6333], size: 0.1 }, // São Paulo
    { location: [19.4326, -99.1332], size: 0.1 },  // Mexico City
    { location: [40.7128, -74.006], size: 0.1 },   // New York
    { location: [34.6937, 135.5022], size: 0.05 }, // Osaka
    { location: [41.0082, 28.9784], size: 0.06 },  // Istanbul
  ],
};

export default function Globe({ className, config = {} }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const widthRef = useRef<number>(0);
  const phiRef = useRef<number>(0);
  const globeInstanceRef = useRef<GlobeInstance | null>(null);

  const updatePointerInteraction = useCallback((value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  }, []);

  const updateMovement = useCallback((clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setRotation(delta / 200);
    }
  }, []);

  const onRender = useCallback((state: Record<string, number>) => {
    if (!pointerInteracting.current) {
      phiRef.current += 0.005;
    }
    state.phi = phiRef.current + rotation;
    state.width = widthRef.current * 2;
    state.height = widthRef.current * 2;
  }, [rotation]);

  const handleResize = useCallback(() => {
    if (canvasRef.current) {
      widthRef.current = canvasRef.current.offsetWidth;
      if (globeInstanceRef.current) {
        globeInstanceRef.current.updateWidth(widthRef.current * 2);
      }
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const mergedConfig: COBEOptions = {
      ...DEFAULT_GLOBE_CONFIG,
      ...config,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender,
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    globeInstanceRef.current = createGlobe(canvasRef.current, mergedConfig) as unknown as GlobeInstance;

    requestAnimationFrame(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (globeInstanceRef.current) {
        globeInstanceRef.current.destroy();
      }
    };
  }, [config, onRender, handleResize]);

  return (
    <div className={cn("absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]", className)}>
      <canvas
        className={cn("size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]")}
        ref={canvasRef}
        onPointerDown={(e) => updatePointerInteraction(e.clientX - pointerInteractionMovement.current)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  );
}