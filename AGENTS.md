# AGENTS.md — Whistle Frontend

This file is the **canonical** contract for any agent (Claude, Codex, Cursor, Aider, Cline, etc.) touching this codebase. `CLAUDE.md` defers to this document.

If a rule here conflicts with model "memory" of how Next.js/React/Tailwind used to work — this file wins. Read it before writing code.

---

## 0. Project Identity

**Product:** Whistle — *AI helpers for football*.
**One-liner:** Three AI helpers. Every World Cup match. You fund who you trust — they do the work.

The user **funds a helper**, they don't pick plays themselves. Three named AI helpers act during matches on the user's behalf:

| Slug (code) | Display name | Role | What they do | Focus |
|---|---|---|---|---|
| `scout` | **Emma** | Saves great moments | Keeps the best bits from every match | Moments |
| `bookie` | **Jack** | Places match bets | Bets on what happens next in the game | Bets |
| `manager` | **Tom** | Picks your players | Chooses which players to back each match | Teams |

**Internal slugs stay** (`scout`, `bookie`, `manager`) for routes, types, and CSS. **All user-facing copy uses human names** (Emma, Jack, Tom) and plain language. **Never use "fantasy" in UI copy** — say "picks players" or "your team".

**Copy voice — mandatory:**
- Say **fund / back / spending limit**, not allocate / capital / session key / ceiling (except in wallet/contract code comments never shown in UI).
- Say **saved highlight / keepsake**, not mint / NFT / ERC-721.
- Say **bet / prediction**, not micro-market / position / edge.
- Say **team / players / picks**, not fantasy / roster / GameFi.
- Say **logged / recorded**, not onchain / settled in one block — unless the user is on a technical contracts page.
- Write for someone who knows football but **not** web3 and **not** crypto jargon.
- `PositionManager` is a **smart contract name** — never confuse it with Tom (the player picker).

**Licensing-clean fantasy:** players are referenced by **nation + jersey number** only (`ARG 10`, not "Messi"). Never name real players, never use real likenesses, never embed broadcast footage.

**Submission constraints:** OKX X Cup, deadline May 28 12:00 UTC. AI judges + human judges grade independently on onchain data, code quality, innovation, market potential. Code-quality reads cannot be faked at the last minute — write docstrings, tests, and clean commit history as we go.

**Single source of truth for agent display copy:** `lib/mock/agents.ts`.

---

## 1. Stack (locked)

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, React 19). This is NOT Next 13/14 — read `node_modules/next/dist/docs/01-app/` before touching any framework API |
| Language | TypeScript **strict** — no `any` ever |
| Styling | **Tailwind v4** with `@theme inline`, oklch tokens, `tw-animate-css` |
| UI Primitives | Radix UI + `@base-ui/react` (stripped of defaults) + shadcn (New York) |
| Animation | **Motion** (`motion/react`) — never import from `framer-motion` directly |
| Smooth scroll | **Lenis** (already wired in `components/providers/smooth-scroll.tsx`) |
| Route transitions | **View Transitions API** (Next 16 native — use `unstable_ViewTransition` or `<ViewTransition>` per Next 16 docs) |
| Top progress bar | **nextjs-toploader** — wired once at root, violet to match brand |
| Server state | **TanStack Query** + Axios client in `lib/api/` |
| Wallet | **wagmi + viem** with OKX Wallet SDK targeting X Layer mainnet (chainId 196). The current code uses Reown/Etherlink — migrate when working on wallet flows |
| Icons | **`hugeicons-react`** (primary). For brand logos / fallbacks: `react-icons/pi` (Phosphor) or `@phosphor-icons/react/dist/ssr`. **Never lucide.** **Never hand-write SVG icons.** |
| Fonts | Geist Sans, Geist Mono, Instrument Serif via `next/font/google` |
| IDs | `nanoid` only — never `uuid`, never `Date.now()` |
| Package manager | `pnpm`. New deps via CLI only (`pnpm add`) — never hand-edit `package.json` |

**Ports:** frontend `7011`, backend `7010`. Frontend reads backend via `NEXT_PUBLIC_API_URL` (default `http://localhost:7010/api/v1`).

---

## 2. Mandatory Design Procedures

Apply **every one** of these to **every component**. These are not suggestions.

### Procedure 1 — Progressive Disclosure
Never dump everything on screen. Agent decisions, position math, roster reasoning — all revealed through interaction (hover, scroll-driven reveals, command menus, accordions). The activity feed is the reference pattern: events stream in, the reasoning expands on click.

### Procedure 2 — Atmospheric Depth (no drop shadows)
Elevation is conveyed by **ambient glow** and **1px border opacity shifts**, never CSS `box-shadow`.
- Sit on obsidian (`#0A0A0A`) or elevated (`#111113`)
- Borders: `border-white/10` default → `border-white/20` hover → `border-violet-500/40` active
- Atmospheric light from `<AmbientGlow>` backdrops at section anchors
- Data containers use `<GlowCard>` (mouse-tracked spotlight + optional inner highlight ring)
- `shadow-none` is still the default. Glow primitives replace it.

### Procedure 3 — 8-Point Spatial Grid
Every margin, padding, gap, line-height MUST be a multiple of **8** (or 4 for micro).
- Sections: `py-24` / `py-32` / `py-48`
- Cards/inputs: `p-6` / `p-8` / `gap-4` / `gap-6`
- **No arbitrary values.** `mt-[17px]` is banned. Use the Tailwind scale.

### Procedure 4 — Physical Motion (Spring Physics Only)
All stateful motion via Motion springs from `motion/react`. Never `ease-in-out` for stateful transitions.
- **Default spring:** `{ type: "spring", stiffness: 400, damping: 30 }`
- **Gentle spring:** `{ type: "spring", stiffness: 300, damping: 35 }`
- **Hover buttons:** `whileHover={{ scale: 0.98 }}` — depress into page, never balloon outward
- **Scroll entry:** `whileInView={{ ... }}` with `viewport={{ once: true, margin: "-15%" }}` — never re-animate on each scroll-by
- **Above-the-fold mount:** stagger with `delay: index * 0.05`, not `whileInView`
- **Continuous loops** (orbit, pulse-glow, beam-trace, flicker): CSS keyframes — Motion is overkill

### Procedure 5 — Proof-of-Work Art Direction
No illustrations. No stock 3D. No unDraw. No vague gradients of "AI brains." The visuals ARE the product:
- Real JSON of an agent decision as the hero artifact
- An orbital diagram of Emma / Jack / Tom around a match clock
- Live data-viz charts (bets placed, highlights saved, team changes) as stat containers
- The activity feed terminal IS the product demo
- Block explorer screenshots are valid art — every action is auditable

### Procedure 6 — Empty State Obsession
Never leave a container blank. Every empty/idle state is designed:
- Dashed borders (`border-dashed border-white/10`)
- Pulsing status dots (`animate-pulse-glow`) with monospace labels: `AWAITING_KICKOFF`, `LISTENING`, `NO_POSITIONS_OPEN`, `SCOUT_IDLE`
- Skeleton shapes hinting at what will appear
- Idle states should feel like a server room before kickoff, not a 404

### Procedure 7 — Geometry Rules
Geometry communicates intent:
- **Pill CTAs** (`rounded-full`) — primary actions only (`variant="violet"`)
- **Data cards / feature tiles** — `rounded-xl` / `rounded-2xl`
- **Section containers, glow cards** — `rounded-2xl` max
- **Chips, badges, small tiles** — `rounded-sm`
- **Terminal panels, raw JSON, tx receipts** — `rounded-none` (hard edges = machine)

### Procedure 8 — Lenis is the Floor
Smooth scroll is the foundation, not a finishing touch. Lenis is initialized once at the root.
- Never set `scroll-behavior: smooth` in CSS — fights Lenis
- For anchor jumps, use Lenis's `scrollTo()` (expose via context if needed) — not `element.scrollIntoView` with smooth
- Respect `prefers-reduced-motion`: disable Lenis when set (already handled by Lenis when `syncTouch: false` + we detect the media query)
- ScrollTrigger/scroll-driven Motion variants are fine — Lenis fires `scroll` events the same way

### Procedure 9 — View Transitions for Route & UI State
Next 16's View Transitions are the default for cross-route motion.
- Wrap route boundaries with `<ViewTransition>` (per Next 16 docs at `node_modules/next/dist/docs/`)
- Use them for: agent-detail enter/exit, leaderboard sort changes, activity-feed item dismiss
- Fall back gracefully on browsers without support — never block render
- Never combine View Transitions with a competing Motion `layoutId` on the same element

---

## 3. Design Tokens

### Typography (Geometric Authority)
1. **Display (Sovereign Voice):** `Geist Sans` weight 600+ — `<h1>`, hero, section headlines. `leading-none`, `tracking-tight`.
2. **Interface (Clarity):** `Geist Sans` weight 400–500 — body, buttons, labels, nav.
3. **The Machine (Cryptographic Truth):** `Geist Mono` — wallet addresses, tx hashes, contract IDs, USDT amounts, agent JSON, terminal UI, `EVENT_` labels. Always `text-xs` / `text-sm`, `tracking-wide` for all-caps.
4. **Instrument Serif** — editorial flourishes only (footer wordmark). Optional.

### Color Palette (Obsidian + Violet)
**Canvas**
- `#0A0A0A` — Obsidian primary canvas (`bg-background`)
- `#111113` — Elevated surfaces (`bg-card`, GlowCard default)
- `#050507` — Deep well (nested containers, section wells)
- `#17171A` — Raised secondary (popovers, terminal chrome)

**Violet (brand accent)**
- `#8B5CF6` — Violet-500 — primary accent, active, glow color
- `#A78BFA` — Violet-400 — hover, highlight, focus rings
- `#7C3AED` — Violet-600 — pressed
- `#2E1065` — Violet-950 — deep gradient stops

**Atmospheric**
- `rgba(139, 92, 246, 0.18)` — hero backdrop glow
- `rgba(139, 92, 246, 0.15)` — corner glow
- `rgba(139, 92, 246, 0.08)` — card hover radial

**Borders & Text**
- `rgba(255, 255, 255, 0.10)` — default border
- `rgba(255, 255, 255, 0.20)` — hover border
- `rgba(139, 92, 246, 0.40)` — active/selected border
- `#F4F4F5` (`zinc-100`) — primary text
- `#A1A1AA` (`zinc-400`) — muted text
- `#52525B` (`zinc-600`) — dim text (metadata, captions)

### Agent identity tints (subtle, never primary)
- **Emma** — cool steel `#9CA3AF` / icon stroke only
- **Jack** — amber `#F59E0B` at < 30% opacity, used for bet badges
- **Tom** — deep emerald `#10B981` at < 30% opacity, used for team/player UI
- All three sit on the violet canvas — never use these as section backgrounds.

### Geometry
- Corners per Procedure 7
- Borders: `1px` everywhere (`border border-white/10`)
- `shadow-none` default — elevation via ambient glow + border opacity
- Gradients allowed **only** as (a) `<AmbientGlow>` backdrops, (b) violet → obsidian CTAs, (c) chart fills, (d) `<BorderBeam>` animated beams

---

## 4. Motion & Physics Contract

| Concern | Tool | Rule |
|---|---|---|
| Component motion | `motion/react` | Spring physics only; never CSS `ease-*` for stateful changes |
| Continuous loops | CSS `@keyframes` | `animate-orbit`, `animate-pulse-glow`, `animate-flicker`, `animate-beam-trace`, `animate-meteor` |
| Smooth scroll | Lenis (root provider) | Single instance, raf-driven, mounted once |
| Route transitions | View Transitions API | Via Next 16's `<ViewTransition>` |
| Top progress | `nextjs-toploader` | Mounted once in `app/layout.tsx`, color `#8B5CF6`, no spinner |
| Reduced motion | `useReducedMotion()` + `motion-reduce:` | Disable Lenis, kill non-essential entry motion, keep loops at ≤ 30% opacity |

**Animation budget per page:** max **3** sustained CSS loops in any single viewport. More = a jukebox. Audit on every PR.

**The `motion-reduce:` discipline:** every entry animation should have a paired `motion-reduce:opacity-100 motion-reduce:translate-y-0` (or equivalent) so accessibility users get the *destination state*, not a frozen mid-animation frame.

---

## 5. Component Library Directive

- **Base logic:** Radix UI + `@base-ui/react` primitives, stripped
- **Motion:** Motion via `motion/react` with spring physics
- **Icons:** `hugeicons-react` first. Fall back to `react-icons/pi` (Phosphor). Brand logos: `react-icons/fa` or `react-icons/si`. **Never lucide.** **Never inline SVG for an icon that exists in a library.**
- **Premium components:**
  - **Magic UI** (MIT) — copy verbatim into `components/ui/`: OrbitingCircles, BorderBeam, Meteors
  - **Aceternity UI patterns** (MIT) — adapted into `components/ui/`: BentoGrid, HoverEffect, Spotlight, Aurora, TypewriterEffect, TextGenerateEffect
- **Bespoke primitives:** `<AmbientGlow>`, `<GlowCard>`, `<MiniBarChart>`, `<MiniLineChart>`, `<ActivityRow>`, `<AgentCard>`, `<TxLink>`
- **Forms/inputs:** clean obsidian `<textarea>` with autosize; no standard web chrome; terminal aesthetic
- **Retheme audit:** any legacy indigo `#4F46E5` reference MUST swap to violet `#8B5CF6`

---

## 6. Wallet & X Layer Integration

The current code ships Reown/Etherlink as scaffolding. **For any new wallet or chain work, migrate to:**

- **Chain:** X Layer mainnet — chainId **196**, native token **OKB**, RPC `https://rpc.xlayer.tech`, explorer `https://www.oklink.com/xlayer`
- **Wallet:** **OKX Wallet SDK** as the primary connector via wagmi's injected/walletConnect connectors. WalletConnect v2 as the fallback for non-OKX users.
- **Session keys** for agent capital permission — bounded per-session, per-match ceilings, revocable from the UI
- **Never write a signer that holds user funds in custody.** All capital sits in `PositionManager.sol`; agents act via session-key-scoped delegation
- **Tx UX:** every onchain action shows (a) optimistic state in the activity feed, (b) toast with explorer link, (c) confirmed/failed state within 2 blocks. Use `wagmi`'s `useWaitForTransactionReceipt` — don't poll manually.

**Contract addresses live in `lib/contracts.ts`**, keyed by chain. Never hardcode in components.

---

## 7. Data Layer

- Axios client at `lib/api/client.ts` — base URL from `NEXT_PUBLIC_API_URL`, interceptors centralized
- Per-resource modules: `lib/api/agents.ts`, `lib/api/positions.ts`, `lib/api/matches.ts`, `lib/api/leaderboard.ts`
- Custom hooks at `hooks/use-<resource>.ts`: `useAgents`, `usePositions`, `useMatchFeed`, `useLeaderboard`
- Components consume hooks **only** — never call API functions directly
- **Query keys** via a factory in `lib/api/keys.ts` for consistent cache management
- **Live data** (match events, agent decisions) over WebSocket — wrap in a `useLiveFeed(channel)` hook that emits typed events; render `<ActivityRow>` items
- **Zod schemas** for every external payload — server responses, websocket messages, contract events. Infer types with `z.infer<typeof schema>`. No `unknown` leaks into render layers.

---

## 8. File Organization

```
frontend/
├── app/
│   ├── (marketing)/          # landing, manifesto, docs link-outs
│   ├── agents/[slug]/          # Emma / Jack / Tom detail (slugs: scout, bookie, manager)
│   ├── leaderboard/
│   ├── allocate/             # fund-a-helper flow
│   ├── activity/             # full activity feed (ledger)
│   ├── api/                  # Next route handlers (proxy only — real API is :7010)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                   # Atoms — buttons, cards, glow primitives, charts, toploader wrapper
│   ├── blocks/               # Molecules — hero, agent grid, lifecycle, leaderboard table
│   ├── layout/               # Organisms — navbar, footer, sidebar
│   └── providers/            # smooth-scroll, web3, query, toaster
├── hooks/                    # use-<resource>.ts
├── lib/
│   ├── api/                  # axios client, resource modules, query keys
│   ├── chains.ts             # X Layer + fallback chain defs
│   ├── wagmi.ts              # wagmi config
│   ├── contracts.ts          # address book + ABIs
│   ├── condition-codec.ts    # micro-market encoding (Bookie)
│   ├── friendly-error.ts     # wagmi/viem error → human message
│   └── utils.ts              # cn, formatters, nanoid wrappers
├── types/                    # shared TS types + zod schemas
├── public/
│   ├── brand/                # SVGs (OKB, X Layer, OKX)
│   └── noise.png             # studio-grain texture
└── styles/
```

One component per file. Kebab-case filenames matching the exported component.

---

## 9. Coding Rules (from project guidelines)

- **No comments in code** unless explicitly requested. Well-named identifiers do the work.
- **No `any`.** Use `unknown` + type guards, or ask for the data shape.
- **`@/` absolute imports** everywhere.
- **No `console.log`** in committed code.
- **No `Date.now()` or `Math.random()` for IDs** — use `nanoid`.
- **No `process.env` direct reads** in components — pass via props or a typed config module.
- **Hardcoding ban** — URLs, RPC endpoints, contract addresses, magic numbers, user-facing strings → constants, env, or config.
- **Files ≤ ~150 logic lines.** Split when bigger.
- **Edit existing files** over creating new ones. Co-locate components under `components/<feature>/`.
- **Never preview in browser** to verify edits. Verify with typecheck, lint, `curl`, file inspection. The user runs the dev server.

---

## 10. The No-AI-Flop Checklist (STRICT GATE)

Every PR / change passes this before being declared done. **No exceptions, no "ship it and clean up later."**

### Visual
- [ ] **No purple/indigo "AI gradient" backgrounds.** Violet is an accent, not a fill. Big purple blobs are an AI-flop signature.
- [ ] **No generic shadcn dump.** Every shadcn primitive that ships has been retuned (border, radius, motion, density) to the obsidian+violet system.
- [ ] **No lorem ipsum, no `Lorem`, no `placeholder text`.** Real copy or designed empty state.
- [ ] **No stock illustrations, no unDraw, no Storyset, no 3D-blob clip-art.** Proof-of-work art only.
- [ ] **No emojis in UI** unless the user explicitly asked. (Mono-glyph icons via hugeicons.)
- [ ] **No `text-center` walls.** Body copy aligns left; centered text is reserved for heroes and chips.
- [ ] **All 8-point spacing.** No `p-[13px]`, no `mt-[17px]`.
- [ ] **Borders, not shadows.** `shadow-*` is banned outside of `<BorderBeam>` / `<AmbientGlow>` and chart-fill gradients.

### Typography
- [ ] At most **2 type sizes** in any card. Tertiary info goes to `text-xs` mono.
- [ ] **Mono for every onchain string** — addresses, hashes, amounts in OKB/USDT, contract IDs.
- [ ] Long addresses **truncated middle** (`0x1234…abcd`) with a copy-on-click affordance.
- [ ] No `text-justify`. No `font-style: italic` on body. Instrument Serif italic only on the footer wordmark.

### Motion
- [ ] Lenis is mounted and not fighting any other smooth-scroll source.
- [ ] All stateful animations use Motion springs — no CSS `transition-all duration-300 ease-in-out` on stateful changes.
- [ ] `viewport={{ once: true, margin: "-15%" }}` on every `whileInView`.
- [ ] **≤ 3 sustained CSS loops** in any single viewport (count meteors, orbits, pulses).
- [ ] **`prefers-reduced-motion` respected** — entry motion disabled, loops faded to ≤ 30%, Lenis disabled.
- [ ] **No hover `scale-110` / `scale-105`** — buttons depress (`scale: 0.98`), they don't balloon.
- [ ] Top progress bar (`nextjs-toploader`) fires on every nav.
- [ ] Route transitions use View Transitions where applicable.

### Interaction
- [ ] Every interactive element has `cursor: pointer` (handled globally in `globals.css`) and a visible `focus-visible:ring-*`.
- [ ] **No bare `outline: none`** — only with a designed `focus-visible:` replacement.
- [ ] Hit targets ≥ 44×44 px on touch viewports.
- [ ] `:disabled` states show `cursor: not-allowed` and **never** `cursor: pointer`.
- [ ] No `cursor: pointer` on non-interactive text or decorative elements.

### Empty / Error / Loading states
- [ ] Every list, table, feed, card has a designed **empty** state (dashed border, pulsing dot, mono label).
- [ ] Every fetcher has a designed **loading** state (skeleton with the same geometry, not a centered spinner).
- [ ] Every fetcher has a designed **error** state with a retry action and a real message (via `friendly-error.ts`, not the raw viem error).

### Content
- [ ] No "Lorem". No "Coming soon" without a designed waitlist CTA. No "Click here". No `console.log("test")` left in.
- [ ] No real player names. No real player likenesses. Use nation + jersey number.
- [ ] All onchain values formatted with locale-aware separators (`Intl.NumberFormat`) — never raw `0.000000000000000001`.

### Accessibility
- [ ] WCAG AA contrast — minimum **4.5:1** for body, **3:1** for large text. Run a contrast check on every new color pairing.
- [ ] Every `<img>` has meaningful `alt` (or empty for decorative).
- [ ] Every form input has a `<label>` or `aria-label`.
- [ ] Tab order is logical; focus is trapped in modals; ESC closes overlays.
- [ ] Charts have a text alternative (table or `aria-label` with the summary).

### Tech hygiene
- [ ] `pnpm exec oxlint` clean on touched files
- [ ] `pnpm typecheck` (or `tsgo --noEmit`) clean — **orchestrator runs this once at the end**, not per sub-agent
- [ ] No `console.log`, no `// TODO` without a tracked task, no dead imports
- [ ] No new top-level dep without justification — check bundle impact

If any box is unchecked and the change ships anyway, treat it as a bug to be fixed in the next change.

---

## 11. Skills Map (when to invoke which)

Whichever agent is running, lean on the right specialized skill. The user runs Claude Code with a rich skill set — pick the one closest to the task before falling back to general-purpose work.

| Task | Skill |
|---|---|
| Build/edit UI components, pages, landing surfaces | `frontend-design`, `emil-design-eng` |
| Audit a finished screen for polish | `polish`, `design:design-critique` |
| Add shadcn primitives, retune them | `shadcn-ui`, `design:design-system` |
| Wire Tailwind v4 tokens and utilities | `tailwind-css` |
| Run a heuristic / UX-pass review | `ux-heuristics`, `design:design-critique` |
| Accessibility audit | `design:accessibility-review`, `web-design-guidelines` |
| Design tokens, naming, system extension | `design:design-system` |
| Microcopy, empty states, CTA wording | `design:ux-copy` |
| SEO audit on the landing | `seo-audit` |
| Add structured data / JSON-LD | already wired in `app/layout.tsx` — extend, don't rewrite |
| Build a video/demo asset | `remotion-best-practices` |
| Tiptap editor (if comment threads ship later) | `tiptap` |
| Verify a change actually works in the running app | `verify`, `run` |
| Pre-merge correctness review | `code-review` |
| Pre-deploy gate | `engineering:deploy-checklist`, `vercel:deploy` |
| Generate scheduled remote agent | `schedule` |
| Read PDFs / xlsx / docx | `anthropic-skills:pdf`, `anthropic-skills:xlsx`, `anthropic-skills:docx` |

**Don't invent skill names.** Only use what's in the live skill list. If nothing fits, do the work directly.

---

## 12. Sub-Agent Discipline

When parallelizing work across sub-agents (Explore, general-purpose, Plan):

- Sub-agents run **lint and per-file checks only** (`pnpm exec oxlint <files>`).
- Sub-agents **do NOT** run `tsc --noEmit` or any full-project typecheck — it's slow, parallel `tsc` invocations starve CPU.
- The **orchestrator runs ONE consolidated typecheck** at the end (`pnpm exec tsgo --noEmit` preferred, falls back to `pnpm typecheck`).
- Use `Explore` for "where is X?" / "find files matching Y" — read-only, returns excerpts.
- Use `Plan` to draft an implementation strategy before touching multiple files.
- Use `general-purpose` for multi-step research with uncertain endpoints.
- **Never** delegate understanding — write prompts that show you've already understood; include file paths and line numbers.

---

## 13. Pre-PR Checklist

1. `pnpm exec oxlint .` clean
2. `pnpm exec tsgo --noEmit` (or `pnpm typecheck`) clean — no `any`, no unused exports
3. No `console.log`, no commented-out blocks, no dead imports
4. **The No-AI-Flop checklist (Section 10) passes in full**
5. New API endpoints documented in `lib/api/<resource>.ts` JSDoc; frontend types match backend response shapes
6. Manual test of the changed path in the running app — user runs the server; describe what to click/check in the PR
7. Conventional commit message — focus on *why*, not *what*. No "Generated with Claude" or "Co-Authored-By: Claude" trailers.
8. If contracts changed, addresses updated in `lib/contracts.ts` and an entry added to `CHANGELOG.md`

---

## 14. The Whistle Manifesto (for tone)

> We did not build a Polymarket clone. We built the agent layer the next four years of crypto-sport runs on.

Three helpers. Public track records. Every decision logged. You pick Emma, Jack, or Tom — they handle the rest.

Every surface — landing, fund flow, leaderboard, activity feed — should feel approachable to a football fan who has never used crypto. Plain words first. Infrastructure tone, not hackathon jargon.

If it looks like a hackathon, it loses.
