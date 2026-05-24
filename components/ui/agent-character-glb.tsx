"use client";

import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { Center, useGLTF } from "@react-three/drei";

import { AgentCharacterPlaceholder } from "@/components/ui/agent-character-placeholder";
import {
  AGENT_MODEL_SCALE,
  AGENT_MODEL_URLS,
} from "@/lib/agent-models";
import type { AgentSlug } from "@/types";

interface AgentCharacterGlbProps {
  slug: AgentSlug;
}

interface BoundaryProps {
  slug: AgentSlug;
  children: ReactNode;
}

interface BoundaryState {
  failed: boolean;
}

class GlbErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <AgentCharacterPlaceholder slug={this.props.slug} />;
    }
    return this.props.children;
  }
}

function GlbModel({ slug }: AgentCharacterGlbProps) {
  const url = AGENT_MODEL_URLS[slug];
  const { scene } = useGLTF(url);
  const model = useMemo(() => scene.clone(true), [scene]);
  const scale = AGENT_MODEL_SCALE[slug];

  return (
    <Center>
      <primitive object={model} scale={scale} />
    </Center>
  );
}

function AgentCharacterGlbInner({ slug }: AgentCharacterGlbProps) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const url = AGENT_MODEL_URLS[slug];

  useEffect(() => {
    let active = true;
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (active) setAvailable(res.ok);
      })
      .catch(() => {
        if (active) setAvailable(false);
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (available === null) {
    return <AgentCharacterPlaceholder slug={slug} />;
  }

  if (!available) {
    return <AgentCharacterPlaceholder slug={slug} />;
  }

  return (
    <GlbErrorBoundary slug={slug}>
      <Suspense fallback={<AgentCharacterPlaceholder slug={slug} />}>
        <GlbModel slug={slug} />
      </Suspense>
    </GlbErrorBoundary>
  );
}

export function AgentCharacterGlb({ slug }: AgentCharacterGlbProps) {
  return <AgentCharacterGlbInner slug={slug} />;
}
