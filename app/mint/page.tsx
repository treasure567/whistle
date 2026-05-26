import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { MintCard } from "@/components/blocks/mint/mint-card";
import { AmbientGlow } from "@/components/ui/ambient-glow";

export const metadata = {
  title: "Mint test OKB",
  description:
    "Mint free test OKB on X Layer testnet. It's the balance you use to fund Emma, Jack, and Tom and to place bets.",
};

export default function MintPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-12 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-3xl px-6 md:px-10 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Testnet faucet
          </span>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Mint your <span className="font-serif-italic text-primary">test OKB.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Test OKB is free play money on X Layer testnet. Mint as much as you
            need, then use it to fund Emma, Jack, and Tom or to back a call.
          </p>
        </div>
      </section>
      <section className="pb-28">
        <MintCard />
      </section>
      <SiteFooter />
    </main>
  );
}
