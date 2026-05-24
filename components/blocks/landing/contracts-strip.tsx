"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight01Icon } from "hugeicons-react";

import { CONTRACT_LIST } from "@/lib/contracts";
import { explorerAddressUrl, truncateAddress } from "@/lib/format";

export function ContractsStrip() {
  return (
    <section id="contracts" className="relative py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
              Onchain
            </span>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-5xl">
              Built in the open. <span className="font-serif italic font-normal text-violet-200">Fully verified.</span>
            </h2>
          </div>
          <span className="font-mono text-[11px] text-emerald-300">
            X Layer mainnet · chainId 196
          </span>
        </motion.div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0E]">
          <div className="grid grid-cols-12 border-b border-white/5 bg-white/[0.02] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <div className="col-span-3">Contract</div>
            <div className="col-span-5">Address</div>
            <div className="col-span-2">Lines</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          {CONTRACT_LIST.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.04 }}
              className="group grid grid-cols-12 items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors last:border-b-0 hover:bg-white/[0.02]"
            >
              <div className="col-span-3 flex flex-col">
                <span className="font-mono text-sm tracking-tight text-zinc-100">{c.name}</span>
                <span className="mt-0.5 text-[11px] text-zinc-500">{c.description}</span>
              </div>
              <div className="col-span-5">
                <Link
                  href={explorerAddressUrl(c.address)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group/link inline-flex items-center gap-2 font-mono text-[12px] text-zinc-300 transition-colors hover:text-violet-200"
                >
                  <span>{truncateAddress(c.address, 6)}</span>
                  <ArrowUpRight01Icon size={11} className="transition-transform group-hover/link:translate-x-px group-hover/link:-translate-y-px" />
                </Link>
              </div>
              <div className="col-span-2 font-mono text-[12px] text-zinc-400">~{c.lines} lines</div>
              <div className="col-span-2 flex justify-end">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
                  Verified
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
