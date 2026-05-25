import type { SimResult } from "./engine";

export type CommentTone = "goal" | "card" | "chance" | "info" | "color";
export type SimComment = { minute: number; text: string; tone: CommentTone };

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)] ?? arr[0]!;
}

/// Builds a broadcast-style, state-aware commentary stream from a finished
/// simulation. Deterministic per seed so a replay reads the same.
export function buildCommentary(result: SimResult): SimComment[] {
  const rng = mulberry32((result.seed ^ 0x9e3779b9) >>> 0);
  const { home, away, events } = result;
  const name = (side: "home" | "away" | "neutral") => (side === "away" ? away.name : home.name);
  const comments: SimComment[] = [];
  const busy = new Set(events.map((e) => e.minute));

  let h = 0;
  let a = 0;

  for (const e of events) {
    switch (e.type) {
      case "kickoff":
        comments.push({
          minute: 0,
          tone: "info",
          text: pick(rng, [
            `We're underway! ${home.name} take on ${away.name}.`,
            `Kick-off! ${home.name} get the tournament dream rolling against ${away.name}.`,
          ]),
        });
        break;
      case "goal":
      case "penalty-goal": {
        if (e.side === "home") h += 1;
        else a += 1;
        const team = name(e.side);
        const scorer = e.player ?? team;
        const state =
          h === a
            ? "and we're all square!"
            : (e.side === "home") === h > a
              ? `${team} are in front!`
              : `${team} pull one back!`;
        comments.push({
          minute: e.minute,
          tone: "goal",
          text:
            e.type === "penalty-goal"
              ? pick(rng, [
                  `GOAL! ${scorer} sends the keeper the wrong way from the spot. ${home.code} ${h}-${a} ${away.code} — ${state}`,
                  `Ice cold from twelve yards! ${scorer} makes it ${h}-${a}. ${state}`,
                ])
              : pick(rng, [
                  `GOAL! ${scorer} finishes it superbly! ${home.code} ${h}-${a} ${away.code}. ${state}`,
                  `It's in! ${scorer} with a clinical strike, ${h}-${a}. ${state}`,
                  `${scorer} buries it! The ${team} bench is up. ${h}-${a} and ${state}`,
                ]),
        });
        break;
      }
      case "penalty-miss":
        comments.push({
          minute: e.minute,
          tone: "chance",
          text: pick(rng, [
            `Penalty MISSED! ${e.player ?? name(e.side)} skies it over the bar!`,
            `Saved! The spot-kick is turned away — what a let-off.`,
          ]),
        });
        break;
      case "save":
        comments.push({
          minute: e.minute,
          tone: "chance",
          text: pick(rng, [
            `Huge save! ${e.player ?? name(e.side)} is denied at point-blank range.`,
            `What a stop! The keeper keeps it level.`,
          ]),
        });
        break;
      case "chance":
        comments.push({
          minute: e.minute,
          tone: "chance",
          text: pick(rng, [
            `So close! ${e.player ?? name(e.side)} drags it just wide.`,
            `Half-chance for ${name(e.side)}, flashed across the face of goal.`,
          ]),
        });
        break;
      case "yellow":
        comments.push({
          minute: e.minute,
          tone: "card",
          text: pick(rng, [
            `Into the book goes ${e.player ?? name(e.side)} for a cynical challenge.`,
            `Yellow card. ${e.player ?? name(e.side)} will need to be careful now.`,
          ]),
        });
        break;
      case "red":
        comments.push({
          minute: e.minute,
          tone: "card",
          text: pick(rng, [
            `RED CARD! ${e.player ?? name(e.side)} is off — ${name(e.side)} down to ten men!`,
            `He's gone! A straight red and ${name(e.side)} are up against it.`,
          ]),
        });
        break;
      case "halftime":
        comments.push({ minute: 45, tone: "info", text: `Half-time: ${home.code} ${h}-${a} ${away.code}.` });
        break;
      case "fulltime":
        comments.push({
          minute: 90,
          tone: "info",
          text: pick(rng, [
            `Full-time! ${home.code} ${h}-${a} ${away.code}.`,
            `That's the final whistle — ${home.code} ${h}-${a} ${away.code}.`,
          ]),
        });
        break;
    }
  }

  // colour commentary on quiet minutes for a live broadcast feel
  for (let m = 3; m < 90; m += 1) {
    if (busy.has(m) || rng() > 0.13) continue;
    const side = rng() < 0.5 ? home : away;
    comments.push({
      minute: m,
      tone: "color",
      text: pick(rng, [
        `${side.name} knock it around, looking for a way through.`,
        `Good tempo from ${side.name} in midfield.`,
        `${side.name} win it back high up the pitch.`,
        `A scrappy spell, neither side able to settle.`,
        `The crowd roars ${side.name} forward.`,
        `${side.name} switch the play, stretching the game.`,
      ]),
    });
  }

  return comments.sort((x, y) => x.minute - y.minute);
}
