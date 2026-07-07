/**
 * Particle System
 * Creates floating pixel art particles for various effects
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PixelHeart, PixelStar, PixelSparkle } from "./pixel-illustrations";

interface ParticleSystemProps {
  active: boolean;
  type?: "hearts" | "stars" | "sparkles" | "food" | "mixed";
  count?: number;
  duration?: number;
  origin?: { x: number; y: number };
  className?: string;
}

interface Particle {
  id: number;
  type: "heart" | "star" | "sparkle" | "food";
  x: number;
  y: number;
  delay: number;
  size: number;
  color: string;
}

export function ParticleSystem({
  active,
  type = "mixed",
  count = 10,
  duration = 2000,
  origin,
  className = "",
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < count; i++) {
        const particleType = getParticleType(type);
        const angle = (Math.random() * 2 * Math.PI);
        const distance = 20 + Math.random() * 80;
        
        newParticles.push({
          id: Date.now() + i,
          type: particleType,
          x: origin ? origin.x + Math.cos(angle) * distance : Math.random() * 100,
          y: origin ? origin.y + Math.sin(angle) * distance : Math.random() * 100,
          delay: i * (duration / count / 2),
          size: 12 + Math.random() * 12,
          color: getRandomColor(),
        });
      }
      
      setParticles(newParticles);

      // Clear particles after animation
      const timer = setTimeout(() => {
        setParticles([]);
      }, duration + 500);

      return () => clearTimeout(timer);
    }
  }, [active, type, count, duration, origin]);

  if (particles.length === 0) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          particle={particle}
          duration={duration}
        />
      ))}
    </div>
  );
}

function Particle({ particle, duration }: { particle: Particle; duration: number }) {
  const { type, x, y, delay, size, color } = particle;

  return (
    <div
      className="absolute animate-particle-float"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {type === "heart" && <PixelHeart size={size} className={color} />}
      {type === "star" && <PixelStar size={size} className={color} />}
      {type === "sparkle" && <PixelSparkle size={size} className={color} />}
      {type === "food" && <span style={{ fontSize: size }}>🍖</span>}
    </div>
  );
}

function getParticleType(systemType: string): "heart" | "star" | "sparkle" | "food" {
  if (systemType === "hearts") return "heart";
  if (systemType === "stars") return "star";
  if (systemType === "sparkles") return "sparkle";
  if (systemType === "food") return "food";
  
  // Mixed - random selection
  const types: Array<"heart" | "star" | "sparkle" | "food"> = ["heart", "star", "sparkle", "food"];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomColor(): string {
  const colors = [
    "text-pink-400",
    "text-yellow-400",
    "text-cyan-400",
    "text-green-400",
    "text-purple-400",
    "text-orange-400",
    "text-red-400",
    "text-blue-400",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Click Effect - Shows particles when clicking/tapping
 */
interface ClickParticlesProps {
  x: number;
  y: number;
  show: boolean;
}

export function ClickParticles({ x, y, show }: ClickParticlesProps) {
  if (!show) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 6;
        const distance = 30;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        return (
          <div
            key={i}
            className="absolute animate-particle-float"
            style={{
              left: offsetX,
              top: offsetY,
              animationDelay: `${i * 50}ms`,
            }}
          >
            <PixelSparkle size={8} className={getRandomColor()} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Trail Effect - Creates a particle trail following cursor/touch
 */
export function useParticleTrail(enabled: boolean = false) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (!enabled) return;

    let lastEmit = 0;
    const emitInterval = 100; // Emit particle every 100ms

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const now = Date.now();
      if (now - lastEmit < emitInterval) return;
      lastEmit = now;

      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;

      const newParticle = { id: now, x, y };
      setParticles((prev) => [...prev, newParticle]);

      // Remove particle after animation
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1000);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, [enabled]);

  return particles;
}

export function ParticleTrailRenderer({
  particles,
}: {
  particles: Array<{ id: number; x: number; y: number }>;
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-particle-float"
          style={{
            left: particle.x,
            top: particle.y,
          }}
        >
          <PixelSparkle size={10} className="text-cyan-400" />
        </div>
      ))}
    </div>
  );
}
