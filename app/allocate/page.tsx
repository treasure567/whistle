import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AllocateWizard } from "@/components/blocks/allocate/allocate-wizard";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import type { AgentSlug } from "@/types";

export const metadata = {
  title: "Fund an agent",
  description:
    "Pick Emma, Jack, or Tom. Set a spending limit. Confirm once — they handle the rest.",
};

const VALID: ReadonlyArray<AgentSlug> = ["scout", "bookie", "manager"];

export default async function AllocatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = typeof params.agent === "string" ? params.agent : undefined;
  const initialAgent =
    raw && (VALID as ReadonlyArray<string>).includes(raw)
      ? (raw as AgentSlug)
      : undefined;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-12 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-3xl px-6 md:px-10 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            Get started
          </span>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-50 md:text-5xl">
            Fund someone <span className="font-serif italic font-normal text-violet-200">in four steps.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
            Pick Emma, Jack, or Tom. Set how much they can spend. Choose how
            long it lasts. Confirm once — they work inside your limits.
          </p>
        </div>
      </section>
      <section className="pb-28">
        <AllocateWizard initialAgent={initialAgent} />
      </section>
      <SiteFooter />
    </main>
  );
}
