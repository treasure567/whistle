# CLAUDE.md — Whistle Frontend

> **The canonical agent contract is [`AGENTS.md`](./AGENTS.md). Read it first. Everything in this file is additive — Claude-specific guidance only.**

If anything below contradicts `AGENTS.md`, `AGENTS.md` wins. Same for the user's global `~/.claude/CLAUDE.md`: project-specific rules in `AGENTS.md` override global rules where they overlap.

---

## 1. Read this in order

1. **`AGENTS.md`** (this folder) — project identity, stack, design procedures, motion contract, no-AI-flop checklist, file org. Non-negotiable.
2. The user's global `~/.claude/CLAUDE.md` — coding rules (no comments, no `any`, pnpm, `nanoid`, react-icons/pi fallback, `@/` imports, port 7011, "Ask first, code later").
3. The Whistle PRD at `/Users/apple/Downloads/xdev_PRD.pdf` — product context: three helpers (**Emma / Jack / Tom**, slugs `scout` / `bookie` / `manager`) for the OKX X Cup hackathon, deadline May 28 12:00 UTC. **All UI copy must use human names and plain language** — never "fantasy" in user-facing text. See AGENTS.md §0 Copy voice.

---

## 2. Next 16 discipline (preserved from upstream)

This is **NOT** the Next.js you remember. APIs, conventions, file structure may differ from your training data.

- Before writing code that touches a Next 16 API, **read the relevant guide in `node_modules/next/dist/docs/01-app/`**.
- Heed deprecation notices in build output.
- Confirmed-safe APIs in use here: `next/font/google`, `next/image`, `"use client"`, server components, App Router route handlers.
- For View Transitions, prefer Next 16's built-in `<ViewTransition>` over hand-rolled CSS transitions.

---

## 3. Claude-specific operating rules

### File discipline
- Use the `Edit` tool to modify existing files. `Write` only for genuinely new files.
- Never create a new file when an existing one fits — co-locate components under `components/<feature>/`.
- Never add a `README.md` or random doc unless asked.
- Never write code comments unless explicitly requested.
- Never add a `Co-Authored-By: Claude` / `Generated with Claude` trailer in commits, PRs, or code.

### Verification protocol
- **Never preview in browser to verify edits.** No `mcp__Claude_Preview__*`, no `mcp__Claude_in_Chrome__*`, no screenshot of the dev server. The user runs `pnpm dev --port 7011` themselves.
- Verify with: `pnpm exec oxlint <files>`, `pnpm exec tsgo --noEmit` (or `pnpm typecheck`), `curl` for API checks, `Read` for file inspection.
- If you genuinely can't verify a UI change without running it, **say so explicitly** rather than claim success.

### Tooling
- **Package install:** `pnpm add <name>` only. Never hand-edit `package.json` / `package-lock.json`.
- **Lint per file (fast):** `pnpm exec oxlint <changed-files>` — Rust-based, milliseconds.
- **Full project typecheck:** `pnpm exec tsgo --noEmit` if `@typescript/native-preview` is installed; otherwise `pnpm typecheck`. **Run once at the end**, not per sub-agent.
- **Search wide:** spawn the `Explore` sub-agent. **Search narrow:** `Bash` with `grep` / `find`.
- **Plan multi-file changes:** spawn the `Plan` sub-agent before touching files.
- **Verify a finished feature works end-to-end in the app:** invoke the `verify` skill (it's allowed to launch the app; you are not allowed to do it for visual verification).

### Sub-agent rules
- Sub-agents lint per file. **Sub-agents never run `tsc` / `pnpm typecheck`**.
- The orchestrator runs ONE consolidated typecheck after merging parallel branches.
- Launch independent agents in a **single message** with multiple `Agent` tool calls so they run concurrently.

### When the task is non-trivial
Follow the user's "Ask first, code later" rule:
- Surface clarifying questions via `AskUserQuestion` before implementing.
- Offer 2–4 distinct options when an approach choice exists.
- Never silently pick between meaningful alternatives.

---

## 4. Skill cheat-sheet (Claude Code)

Pick the right specialized skill before falling back to generic work. Only use skills that appear in the live `available-skills` list — never invent names.

| If the task is… | Invoke |
|---|---|
| Build a landing/component/page | `frontend-design`, `emil-design-eng` |
| Polish a finished screen | `polish` |
| Critique a design or screenshot | `design:design-critique` |
| Add or retune shadcn primitives | `shadcn-ui` |
| Tailwind v4 utility / token work | `tailwind-css` |
| UX heuristic review | `ux-heuristics`, `design:design-critique` |
| Accessibility audit | `design:accessibility-review`, `web-design-guidelines` |
| Token / design-system extension | `design:design-system` |
| Microcopy, CTAs, empty states | `design:ux-copy` |
| SEO audit on landing | `seo-audit` |
| Build the 90s demo video | `remotion-best-practices` |
| Rich-text editor surface | `tiptap` |
| Verify a change actually works | `verify`, `run` |
| Final correctness pass before merge | `code-review` |
| Pre-deploy gate | `engineering:deploy-checklist`, `vercel:deploy` |
| Recurring monitoring task | `loop`, `schedule` |
| Read a PDF/xlsx/docx | `anthropic-skills:pdf`, `anthropic-skills:xlsx`, `anthropic-skills:docx` |

---

## 5. The No-AI-Flop quick gate (full list in `AGENTS.md` §10)

Before declaring any visual change "done":

- [ ] **No purple/indigo gradient fills.** Violet is an accent, never a background blob.
- [ ] **No raw shadcn defaults.** Every primitive retuned to obsidian+violet, 1px border, ambient-glow elevation.
- [ ] **No `text-center` walls, no centered body copy.** Heroes and chips only.
- [ ] **No lorem, no "Coming soon," no stock illustrations, no emojis** in UI.
- [ ] **8-point spacing.** No `mt-[17px]`. No arbitrary pixel values.
- [ ] **Spring motion only** for stateful changes (`stiffness: 400, damping: 30`). No `transition-all duration-300 ease-in-out`.
- [ ] **Hover depresses** (`scale: 0.98`), never balloons.
- [ ] **Lenis is mounted**, no competing `scroll-behavior: smooth`.
- [ ] **`whileInView`** uses `viewport={{ once: true, margin: "-15%" }}`.
- [ ] **`prefers-reduced-motion` respected** — entry motion off, loops dimmed, Lenis disabled.
- [ ] **`nextjs-toploader` fires** on every nav (violet, no spinner).
- [ ] **View Transitions** wired for route-level motion.
- [ ] **Designed empty + loading + error states** — no centered spinners, no blank cards.
- [ ] **Mono font for every onchain string** (addresses, hashes, amounts, contract IDs).
- [ ] **Real player names absent** — nation + jersey number only (`ARG 10`).
- [ ] **WCAG AA contrast** (4.5:1 body, 3:1 large).
- [ ] **`cursor: pointer` only on interactive elements**, `not-allowed` on `:disabled`, `focus-visible:ring-*` everywhere.
- [ ] **`pnpm exec oxlint <touched files>` clean.**

If any box is unchecked, fix before claiming the task done.

---

## 6. Things to migrate from upstream Arbiter

The codebase ships with Arbiter scaffolding (Etherlink + Reown). Touch these only when the task calls for it — don't rip out the working scaffold preemptively:

- `lib/chains.ts` — replace `etherlinkTestnet` with X Layer mainnet (chainId 196). Keep the export shape.
- `lib/wagmi.ts` — swap `@reown/appkit-adapter-wagmi` for OKX Wallet SDK + wagmi connectors. WalletConnect v2 as fallback.
- `components/providers/web3.tsx` — drop `createAppKit({...})` Reown init; replace with OKX SDK config + a minimal connect button.
- `app/layout.tsx` — rewrite metadata + structured data for Whistle; replace `arbiter-gamma.vercel.app` and Arbiter copy with the Whistle brand (URL: `whistle-agents.xyz`).
- `lib/contracts.ts` — replace with the five Whistle contracts: `AgentRegistry`, `PositionManager`, `MomentNFT`, `FantasyEntry`, `SettlementOracle`.
- Strings, OG images, icon files — rebrand to Whistle.
- Add: `nextjs-toploader` at root, View Transitions wrapper, Lenis stays as-is.

When migrating, do it in **one focused PR per concern** — don't bundle "chain swap + rebrand + new pages" into a single commit.

---


## 7. If you remember nothing else

1. **`AGENTS.md` is law.** Read it.
2. **Spring physics, not `ease-in-out`.** Lenis at the floor, Motion for state, View Transitions for routes, `nextjs-toploader` at the top.
3. **No purple gradient blobs. No stock illos. No lorem. No emojis.**
4. **Mono font for every onchain string.** Truncated middle for addresses.
5. **Empty / loading / error states are designed**, not afterthoughts.
6. **Pass the No-AI-Flop checklist before claiming done.**
7. **Ask first, code later.** When in doubt, `AskUserQuestion`.
