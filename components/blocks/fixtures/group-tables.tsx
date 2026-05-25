import { FlagOrb } from "@/components/ui/flag-orb";
import { WC_GROUPS, teamsInGroup } from "@/lib/wc-teams";

export function GroupTables() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
          Groups
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Tables open at kickoff
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WC_GROUPS.map((group) => (
          <div key={group} className="rounded-2xl border border-white/10 bg-[#0B0B0E] p-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold tracking-tight text-zinc-100">Group {group}</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                FIFA rank
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {teamsInGroup(group).map((team, index) => (
                <div key={team.code} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 font-mono text-[11px] tabular-nums text-zinc-600">
                    {index + 1}
                  </span>
                  <FlagOrb code={team.code} size={22} />
                  <span className="flex-1 truncate text-sm text-zinc-100">{team.name}</span>
                  <span className="font-mono text-[11px] tabular-nums text-zinc-400">
                    #{team.rank}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
