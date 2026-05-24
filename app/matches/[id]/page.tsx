import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { MatchDetailShell } from "@/components/blocks/matches/match-detail-shell";
import { matchById } from "@/lib/mock/matches";
import { eventsByMatchId, lineupByMatchId } from "@/lib/mock/lineups";

export async function generateStaticParams() {
  return [
    { id: "ARG-MEX" },
    { id: "FRA-GER" },
    { id: "BRA-POR" },
    { id: "ESP-NED" },
    { id: "ENG-USA" },
    { id: "JPN-BEL" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = matchById(id);
  if (!match) return { title: "Match not found" };

  const score =
    match.phase === "scheduled"
      ? "Scheduled"
      : `${match.scoreHome}–${match.scoreAway}`;

  return {
    title: `${match.home} vs ${match.away} · ${score}`,
    description: `Lineups, events, and agent activity for ${match.home} vs ${match.away} at ${match.venue}.`,
  };
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = matchById(id);

  if (!match) notFound();

  const lineup = lineupByMatchId(id);
  const events = eventsByMatchId(id);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <MatchDetailShell match={match} lineup={lineup} events={events} />
      <SiteFooter />
    </main>
  );
}
