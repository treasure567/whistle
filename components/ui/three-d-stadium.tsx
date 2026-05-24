"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float, Line, Ring } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

import type { AgentSlug } from "@/types";

const WORLD_CUP_SVG = "/brand/world-cup.svg";

const AGENT_COLOR: Record<AgentSlug, string> = {
  scout: "#9CA3AF",
  bookie: "#F59E0B",
  manager: "#10B981",
};

const AGENT_ORDER: AgentSlug[] = ["scout", "bookie", "manager"];

function WorldCupTrophy() {
  const svg = useLoader(SVGLoader, WORLD_CUP_SVG);

  const { meshes, scale, offset } = useMemo(() => {
    const items: { geometry: THREE.ShapeGeometry; color: string }[] = [];

    svg.paths.forEach((path) => {
      const style = (path.userData?.style ?? {}) as { fill?: string };
      const color =
        style.fill && style.fill !== "none" ? style.fill : "#357050";

      SVGLoader.createShapes(path).forEach((shape) => {
        items.push({ geometry: new THREE.ShapeGeometry(shape), color });
      });
    });

    const probe = new THREE.Group();
    items.forEach(({ geometry }) => {
      probe.add(new THREE.Mesh(geometry));
    });

    const box = new THREE.Box3().setFromObject(probe);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, 0.001);
    const scale = 1.08 / maxDim;

    return {
      meshes: items,
      scale,
      offset: center.multiplyScalar(-scale),
    };
  }, [svg]);

  return (
    <group rotation={[Math.PI, 0, 0]}>
      <group scale={scale} position={offset}>
        {meshes.map(({ geometry, color }, index) => (
          <mesh key={index} geometry={geometry}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.18}
              metalness={0.55}
              roughness={0.32}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CoreOrb() {
  const wireframeRef = useRef<Group>(null);
  useFrame((state) => {
    if (!wireframeRef.current) return;
    wireframeRef.current.rotation.y = state.clock.elapsedTime * 0.18;
    wireframeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.12;
  });

  return (
    <group>
      <group ref={wireframeRef}>
        <mesh>
          <icosahedronGeometry args={[0.95, 1]} />
          <meshStandardMaterial
            color="#8B5CF6"
            emissive="#7C3AED"
            emissiveIntensity={0.55}
            roughness={0.35}
            metalness={0.55}
            wireframe
            opacity={0.9}
            transparent
          />
        </mesh>
      </group>
      <WorldCupTrophy />
      <pointLight color="#A78BFA" intensity={2.5} distance={6} />
    </group>
  );
}

function AgentRing({
  agent,
  radius,
  baseAngle,
  speed,
}: {
  agent: AgentSlug;
  radius: number;
  baseAngle: number;
  speed: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const angle = baseAngle + t * speed;
    groupRef.current.position.x = Math.cos(angle) * radius;
    groupRef.current.position.z = Math.sin(angle) * radius;
    groupRef.current.position.y = Math.sin(t * 0.8 + baseAngle) * 0.18;
    groupRef.current.rotation.y = -angle;
  });

  const color = AGENT_COLOR[agent];

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.5}>
        <mesh>
          <torusGeometry args={[0.22, 0.05, 16, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.1}
            roughness={0.25}
            metalness={0.85}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </Float>
    </group>
  );
}

function OrbitTrail({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const arr: [number, number, number][] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      arr.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return arr;
  }, [radius]);

  return (
    <Line
      points={points}
      color="#A78BFA"
      lineWidth={0.8}
      transparent
      opacity={0.18}
    />
  );
}

function Pitch() {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
      <Ring args={[2.85, 2.95, 64]}>
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.18} side={THREE.DoubleSide} />
      </Ring>
      <Ring args={[1.85, 1.92, 64]}>
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.25} side={THREE.DoubleSide} />
      </Ring>
      <Ring args={[0.55, 0.58, 48]}>
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.35} side={THREE.DoubleSide} />
      </Ring>
    </group>
  );
}

function Scene() {
  const groupRef = useRef<Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.35} color="#3B1E66" />
      <directionalLight position={[3, 4, 2]} intensity={0.5} color="#A78BFA" />
      <directionalLight position={[-3, 2, -3]} intensity={0.2} color="#7C3AED" />

      <Pitch />
      <CoreOrb />

      <OrbitTrail radius={1.7} />
      <OrbitTrail radius={2.35} />
      <OrbitTrail radius={2.9} />

      <AgentRing agent={AGENT_ORDER[0]} radius={2.9} baseAngle={0} speed={0.32} />
      <AgentRing agent={AGENT_ORDER[1]} radius={2.35} baseAngle={Math.PI * 0.66} speed={-0.45} />
      <AgentRing agent={AGENT_ORDER[2]} radius={1.7} baseAngle={Math.PI * 1.33} speed={0.6} />
    </group>
  );
}

interface ThreeDStadiumProps {
  className?: string;
}

export function ThreeDStadium({ className }: ThreeDStadiumProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 1.6, 5.4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
