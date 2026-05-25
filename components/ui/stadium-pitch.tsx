"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Group } from "three";

export type PitchPlayer = { position: string };

const PITCH_W = 7;
const PITCH_L = 10.5;
const HOME_COLOR = "#8B5CF6";
const AWAY_COLOR = "#E4E4E7";
const LINE = "#ffffff";

// z of each position line for a side whose own goal sits at -z (home).
const LINE_Z: Record<string, number> = { GK: 4.4, DEF: 3.0, MID: 1.6, FWD: 0.5 };
const ORDER = ["GK", "DEF", "MID", "FWD"] as const;

function rect(w: number, l: number, cz = 0): [number, number, number][] {
  const x = w / 2;
  const z = l / 2;
  return [
    [-x, 0.04, cz - z],
    [x, 0.04, cz - z],
    [x, 0.04, cz + z],
    [-x, 0.04, cz + z],
    [-x, 0.04, cz - z],
  ];
}

function circle(r: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 48; i += 1) {
    const a = (i / 48) * Math.PI * 2;
    pts.push([Math.cos(a) * r, 0.04, Math.sin(a) * r]);
  }
  return pts;
}

function placeSide(players: PitchPlayer[], side: "home" | "away"): { x: number; z: number }[] {
  const dir = side === "home" ? -1 : 1;
  const out: { x: number; z: number }[] = [];
  for (const pos of ORDER) {
    const line = players.filter((p) => p.position === pos);
    const n = line.length;
    line.forEach((_, i) => {
      const x = n <= 1 ? 0 : -(PITCH_W / 2 - 1) + (i * (PITCH_W - 2)) / (n - 1);
      out.push({ x, z: dir * (LINE_Z[pos] ?? 1) });
    });
  }
  return out;
}

function Marker({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.32, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.3} metalness={0.3} />
      </mesh>
    </group>
  );
}

function Grass() {
  const stripes = 11;
  const len = PITCH_L / stripes;
  return (
    <>
      {Array.from({ length: stripes }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -PITCH_L / 2 + (i + 0.5) * len]}>
          <planeGeometry args={[PITCH_W, len]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#1c7040" : "#176236"} roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}

function Markings() {
  const goal = PITCH_L / 2;
  return (
    <group>
      <Line points={rect(PITCH_W - 0.3, PITCH_L - 0.3)} color={LINE} lineWidth={1.4} transparent opacity={0.65} />
      <Line points={[[-PITCH_W / 2 + 0.15, 0.04, 0], [PITCH_W / 2 - 0.15, 0.04, 0]]} color={LINE} lineWidth={1.4} transparent opacity={0.65} />
      <Line points={circle(1.25)} color={LINE} lineWidth={1.4} transparent opacity={0.6} />
      <Line points={rect(4.6, 2.2, -(goal - 1.1 - 0.15))} color={LINE} lineWidth={1.2} transparent opacity={0.55} />
      <Line points={rect(4.6, 2.2, goal - 1.1 - 0.15)} color={LINE} lineWidth={1.2} transparent opacity={0.55} />
      <Line points={rect(2.4, 1, -(goal - 0.5 - 0.15))} color={LINE} lineWidth={1.2} transparent opacity={0.5} />
      <Line points={rect(2.4, 1, goal - 0.5 - 0.15)} color={LINE} lineWidth={1.2} transparent opacity={0.5} />
    </group>
  );
}

function Stand({
  position,
  rotation,
  size,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#16161d" emissive="#2a2150" emissiveIntensity={0.08} roughness={0.85} />
    </mesh>
  );
}

function Floodlight({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 3.2, 8]} />
        <meshStandardMaterial color="#3a3a44" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[1, 0.5, 0.2]} />
        <meshStandardMaterial color="#fefefe" emissive="#ffffff" emissiveIntensity={1.4} />
      </mesh>
      <pointLight position={[0, 3.3, 0]} color="#dcdcff" intensity={6} distance={18} decay={1.6} />
    </group>
  );
}

function Scene({ homeXI, awayXI }: { homeXI: PitchPlayer[]; awayXI: PitchPlayer[] }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (group.current) group.current.rotation.y = 0.35 + state.clock.elapsedTime * 0.06;
  });

  const home = placeSide(homeXI, "home");
  const away = placeSide(awayXI, "away");
  const ex = PITCH_W / 2 + 2.2;
  const ez = PITCH_L / 2 + 2.2;
  const corner = 0.6;

  return (
    <group ref={group}>
      <ambientLight intensity={0.4} color="#5b4a8a" />
      <directionalLight position={[6, 14, 6]} intensity={0.7} color="#cdbbf5" />

      {/* base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <planeGeometry args={[PITCH_W + 9, PITCH_L + 9]} />
        <meshStandardMaterial color="#0b0b10" roughness={1} />
      </mesh>

      <Grass />
      <Markings />

      {/* raked stands */}
      <Stand position={[ex, 1.1, 0]} rotation={[0, 0, -0.5]} size={[3.2, 0.4, PITCH_L + 3]} />
      <Stand position={[-ex, 1.1, 0]} rotation={[0, 0, 0.5]} size={[3.2, 0.4, PITCH_L + 3]} />
      <Stand position={[0, 1.1, ez]} rotation={[0.5, 0, 0]} size={[PITCH_W + 3, 0.4, 3.2]} />
      <Stand position={[0, 1.1, -ez]} rotation={[-0.5, 0, 0]} size={[PITCH_W + 3, 0.4, 3.2]} />

      <Floodlight x={ex + corner} z={ez + corner} />
      <Floodlight x={-ex - corner} z={ez + corner} />
      <Floodlight x={ex + corner} z={-ez - corner} />
      <Floodlight x={-ex - corner} z={-ez - corner} />

      {home.map((p, i) => (
        <Marker key={`h-${i}`} x={p.x} z={p.z} color={HOME_COLOR} />
      ))}
      {away.map((p, i) => (
        <Marker key={`a-${i}`} x={p.x} z={p.z} color={AWAY_COLOR} />
      ))}
    </group>
  );
}

export function StadiumPitch({
  homeXI,
  awayXI,
  className,
}: {
  homeXI: PitchPlayer[];
  awayXI: PitchPlayer[];
  className?: string;
}) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 11, 12], fov: 38 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene homeXI={homeXI} awayXI={awayXI} />
        </Suspense>
      </Canvas>
    </div>
  );
}
