"use client";

import { useEffect, useRef } from "react";

interface Particle {
  ox: number; oy: number; oz: number; // original position on sphere
  x: number;  y: number;  z: number;  // rotated position
  sx: number; sy: number;             // screen position
  size: number;
  baseOpacity: number;
  color: string;
}

const COLORS = [
  "#25D366", "#4ADE80", "#25D366", "#fdba74",
  "#93c5fd", "#60a5fa", "#bfdbfe", "#a5b4fc",
  "rgba(255,255,255,0.95)", "rgba(255,255,255,0.7)",
];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Fibonacci sphere — even surface distribution
function buildSphere(count: number, r: number): Particle[] {
  const pts: Particle[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const x = Math.cos(theta) * rad * r;
    const z = Math.sin(theta) * rad * r;
    const yr = y * r;
    pts.push({
      ox: x, oy: yr, oz: z,
      x, y: yr, z,
      sx: 0, sy: 0,
      size: Math.random() * 1.4 + 0.6,
      baseOpacity: Math.random() * 0.25 + 0.75,
      color: pick(COLORS),
    });
  }

  // Sparse interior volume
  for (let i = 0; i < 60; i++) {
    const u = Math.random(), v = Math.random();
    const phi = Math.acos(2 * v - 1);
    const theta = 2 * Math.PI * u;
    const ir = r * Math.cbrt(Math.random()) * 0.85;
    const x = ir * Math.sin(phi) * Math.cos(theta);
    const y = ir * Math.cos(phi);
    const z = ir * Math.sin(phi) * Math.sin(theta);
    pts.push({
      ox: x, oy: y, oz: z,
      x, y, z,
      sx: 0, sy: 0,
      size: Math.random() * 0.9 + 0.3,
      baseOpacity: Math.random() * 0.15 + 0.05,
      color: pick(COLORS),
    });
  }

  return pts;
}

export function ParticleHead() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const RADIUS = Math.min(W, H) * 0.37;
    const FOV = 420;

    const particles = buildSphere(380, RADIUS);

    let rotX = 0.28;  // fixed tilt
    let rotY = 0;
    let animId: number;
    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      rotY += 0.0035;
      frame++;

      // Subtle breathing
      const breath = 1 + Math.sin(frame * 0.012) * 0.025;

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      for (const p of particles) {
        const bx = p.ox * breath, by = p.oy * breath, bz = p.oz * breath;

        // Rotate Y
        const x1 = bx * cosY + bz * sinY;
        const z1 = -bx * sinY + bz * cosY;
        // Rotate X
        const y2 = by * cosX - z1 * sinX;
        const z2 = by * sinX + z1 * cosX;

        p.x = x1; p.y = y2; p.z = z2;

        const scale = FOV / (FOV + z2);
        p.sx = cx + x1 * scale;
        p.sy = cy + y2 * scale;
      }

      // Back → front (painter's algorithm)
      particles.sort((a, b) => a.z - b.z);

      for (const p of particles) {
        const scale = FOV / (FOV + p.z);
        const size = p.size * scale;
        // Depth-based opacity: darker at back, brighter at front
        const depthFactor = 0.35 + 0.65 * ((p.z + RADIUS) / (RADIUS * 2));
        const alpha = Math.max(0.03, p.baseOpacity * depthFactor);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = size * 3.5;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, Math.max(0.2, size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={380}
      height={380}
      className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] lg:w-[220px] lg:h-[220px]"
    />
  );
}
