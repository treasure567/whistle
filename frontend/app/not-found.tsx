import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { NotFoundScreen } from "@/components/blocks/not-found/not-found-screen";

export const metadata = {
  title: "Page not found",
  description: "This page doesn't exist on whistle. Head back home or explore agents, activity, and the leaderboard.",
};

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <NotFoundScreen />
      <SiteFooter />
    </main>
  );
}
