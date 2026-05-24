"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import type { Group } from "three";
import { useReducedMotion } from "motion/react";

import { AgentCharacterGlb } from "@/components/ui/agent-character-glb";
import { AGENT_SLUGS } from "@/lib/agent-models";
import { cn } from "@/lib/utils";
import type { AgentSlug } from "@/types";

const TRIO_LAYOUT: Record<
  AgentSlug,
  { position: [number, number, number]; rotation: number }
> = {
  scout: { position: [-1.15, -0.05, 0.15], rotation: 0.35 },
  bookie: { position: [0, 0.05, 0.35], rotation: 0 },
  manager: { position: [1.15, -0.05, 0.15], rotation: -0.35 },
};

interface AgentCharacter3DProps {
  agent?: AgentSlug;
  mode?: "single" | "trio";
  className?: string;
}

export function AgentCharacter3D({
  agent = "scout",
  mode = "single",
  className,
}: AgentCharacter3DProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl bg-[#0A0A0A]", className)}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-[15%] rounded-full bg-violet-500/10 blur-3xl"
      />
      <Canvas
        camera={
          mode === "trio"
            ? { position: [0, 1.05, 4.2], fov: 42 }
            : { position: [0, 1.05, 3.4], fov: 40 }
        }
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
        className="relative z-10"
      >
        <Suspense fallback={null}>
          <Scene agent={agent} mode={mode} animate={!reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Scene({
  agent,
  mode,
  animate,
}: {
  agent: AgentSlug;
  mode: "single" | "trio";
  animate: boolean;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!animate || !groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.18;
  });

  return (
    <>
      <ambientLight intensity={0.45} color="#2E1065" />
      <directionalLight position={[3, 4, 2]} intensity={0.85} color="#F4F4F5" />
      <directionalLight position={[-2, 2, -2]} intensity={0.35} color="#8B5CF6" />
      <spotLight
        position={[0, 4, 2]}
        angle={0.45}
        penumbra={0.8}
        intensity={0.6}
        color="#A78BFA"
      />
      <Environment preset="city" />

      <group ref={groupRef} position={[0, -0.35, 0]}>
        {mode === "trio" ? (
          AGENT_SLUGS.map((slug) => {
            const layout = TRIO_LAYOUT[slug];
            return (
              <group
                key={slug}
                position={layout.position}
                rotation={[0, layout.rotation, 0]}
              >
                <AgentCharacterGlb slug={slug} />
              </group>
            );
          })
        ) : (
          <AgentCharacterGlb slug={agent} />
        )}
      </group>
    </>
  );
}
