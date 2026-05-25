"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioRefs = {
  ctx: AudioContext;
  ambGain: GainNode;
  source: AudioBufferSourceNode;
};

// Synthesised stadium ambience (filtered noise) plus a goal-cheer swell, with
// no audio asset files. Default off so it only starts on a user gesture, which
// also satisfies browser autoplay policies.
export function useStadiumAudio() {
  const [enabled, setEnabled] = useState(false);
  const refs = useRef<AudioRefs | null>(null);
  const enabledRef = useRef(false);

  const ensure = useCallback((): AudioRefs | null => {
    if (refs.current) return refs.current;
    if (typeof window === "undefined") return null;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();

    // Brown-ish noise for a low crowd murmur.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 880;
    const ambGain = ctx.createGain();
    ambGain.gain.value = 0;
    source.connect(lowpass);
    lowpass.connect(ambGain);
    ambGain.connect(ctx.destination);
    source.start();

    refs.current = { ctx, ambGain, source };
    return refs.current;
  }, []);

  const toggle = useCallback(() => {
    const r = ensure();
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    if (!r) return;
    void r.ctx.resume();
    r.ambGain.gain.linearRampToValueAtTime(next ? 0.1 : 0, r.ctx.currentTime + 0.4);
  }, [ensure]);

  const cheer = useCallback(() => {
    const r = refs.current;
    if (!r || !enabledRef.current) return;
    const { ctx, ambGain } = r;
    const now = ctx.currentTime;

    // Swell the crowd murmur.
    ambGain.gain.cancelScheduledValues(now);
    ambGain.gain.setValueAtTime(0.1, now);
    ambGain.gain.linearRampToValueAtTime(0.3, now + 0.18);
    ambGain.gain.linearRampToValueAtTime(0.1, now + 1.8);

    // Bright roar on top.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 1.6, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1200;
    band.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    src.connect(band);
    band.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + 1.6);
  }, []);

  useEffect(() => {
    return () => {
      refs.current?.ctx.close().catch(() => undefined);
      refs.current = null;
    };
  }, []);

  return { enabled, toggle, cheer };
}
