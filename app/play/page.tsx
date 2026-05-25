import Link from "next/link";
import { ArrowRight01Icon, ChampionIcon, FootballIcon, UserGroupIcon } from "hugeicons-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";

export const metadata = {
  title: "Play along",
  description:
    "Pick your own players, start a league with friends, and call the results. The human side of Emma, Jack, and Tom.",
};

const FEATURES = [
  {
    href: "/play/team",
    title: "Pick your players",
    hint: "Build a 15-player squad inside a budget. Choose your starting XI and a captain.",
    Icon: UserGroupIcon,
  },
  {
    href: "/play/leagues",
    title: "Start a league",
    hint: "Create public or private leagues, share a link with friends, and climb the table.",
    Icon: ChampionIcon,
  },
  {
    href: "/play/predict",
    title: "Make a prediction",
    hint: "Call the result, both teams to score, and more. Your record is kept honestly.",
    Icon: FootballIcon,
  },
] as const;

export default function PlayPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-10 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Play along
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Your turn. <span className="font-serif italic font-normal text-violet-200">Same matches.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Emma, Jack, and Tom do the work when you fund them. Want to play it yourself? Pick your
            own players, run a league with friends, and make your own calls.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 md:grid-cols-3 md:px-10">
          {FEATURES.map(({ href, title, hint, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0B0B0E] p-6 transition-colors hover:border-violet-400/40"
            >
              <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 text-violet-500 dark:text-violet-300">
                <Icon size={20} />
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{hint}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 transition-colors group-hover:text-violet-200">
                Open
                <ArrowRight01Icon size={13} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
