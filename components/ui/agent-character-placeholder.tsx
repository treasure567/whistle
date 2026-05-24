"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

import type { AgentSlug } from "@/types";
import { AGENT_DISPLAY } from "@/lib/agent-models";

const SKIN = "#E8B896";
const PANTS = "#1A1A1E";

interface AgentCharacterPlaceholderProps {
  slug: AgentSlug;
}

export function AgentCharacterPlaceholder({
  slug,
}: AgentCharacterPlaceholderProps) {
  const groupRef = useRef<Group>(null);
  const accent = AGENT_DISPLAY[slug].accent;

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
  });

  return (
    <group ref={groupRef}>
      {slug === "scout" && <ScoutBody accent={accent} />}
      {slug === "bookie" && <BookieBody accent={accent} />}
      {slug === "manager" && <ManagerBody accent={accent} />}
    </group>
  );
}

function Head() {
  return (
    <mesh position={[0, 1.42, 0]}>
      <sphereGeometry args={[0.28, 32, 32]} />
      <meshStandardMaterial color={SKIN} roughness={0.55} metalness={0.05} />
    </mesh>
  );
}

function Legs() {
  return (
    <group position={[0, 0.42, 0]}>
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.2]} />
        <meshStandardMaterial color={PANTS} roughness={0.7} />
      </mesh>
      <mesh position={[0.12, 0, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.2]} />
        <meshStandardMaterial color={PANTS} roughness={0.7} />
      </mesh>
    </group>
  );
}

function ScoutBody({ accent }: { accent: string }) {
  return (
    <group>
      <Head />
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[0.52, 0.62, 0.28]} />
        <meshStandardMaterial color="#374151" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.02, 0.18]}>
        <boxGeometry args={[0.36, 0.08, 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} />
      </mesh>
      <group position={[0, 1.48, 0.22]}>
        <mesh position={[-0.1, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
          <meshStandardMaterial color="#111113" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
          <meshStandardMaterial color="#111113" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.28, 0.04, 0.04]} />
          <meshStandardMaterial color="#111113" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      <Legs />
    </group>
  );
}

function BookieBody({ accent }: { accent: string }) {
  return (
    <group>
      <Head />
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[0.5, 0.62, 0.26]} />
        <meshStandardMaterial color={accent} roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.78, 0.14]}>
        <boxGeometry args={[0.14, 0.18, 0.02]} />
        <meshStandardMaterial color="#F4F4F5" emissive="#A78BFA" emissiveIntensity={0.2} />
      </mesh>
      <group position={[0.34, 0.88, 0.08]} rotation={[0, -0.4, 0.1]}>
        <mesh>
          <boxGeometry args={[0.22, 0.3, 0.04]} />
          <meshStandardMaterial color="#111113" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <boxGeometry args={[0.18, 0.22, 0.01]} />
          <meshStandardMaterial
            color="#8B5CF6"
            emissive="#7C3AED"
            emissiveIntensity={0.35}
          />
        </mesh>
      </group>
      <Legs />
    </group>
  );
}

function ManagerBody({ accent }: { accent: string }) {
  return (
    <group>
      <Head />
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[0.58, 0.66, 0.3]} />
        <meshStandardMaterial color="#111113" roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[0.54, 0.62, 0.28]} />
        <meshStandardMaterial color={accent} roughness={0.4} metalness={0.12} />
      </mesh>
      <mesh position={[0, 1.08, 0.12]}>
        <boxGeometry args={[0.12, 0.28, 0.02]} />
        <meshStandardMaterial color="#F4F4F5" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.98, 0.14]}>
        <boxGeometry args={[0.08, 0.12, 0.02]} />
        <meshStandardMaterial color="#7C3AED" roughness={0.4} />
      </mesh>
      <Legs />
    </group>
  );
}
