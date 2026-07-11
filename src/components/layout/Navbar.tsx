"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TwitterConnect } from "@/components/connect/TwitterConnect";
import { MetaMaskConnect } from "@/components/connect/MetaMaskConnect";

const NAV_ITEMS = [
  { label: "RANK_MATRIX", href: "#leaderboard" },
  { label: "QUEST_LOG", href: "#quests" },
  { label: "REWARD_POOL", href: "#rewards" },
  { label: "DOCS", href: "#docs" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-terminal bg-black/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 font-mono">
          <BrandLogo size="sm" priority className="transition-opacity group-hover:opacity-90" />
          <span className="hidden text-sm font-bold uppercase tracking-wider text-terminal group-hover:text-[#00f0ff] transition-colors sm:block">
            Infinite Ponzi Glitch
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-terminal"
            >
              {">"} {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <TwitterConnect compact />
          <MetaMaskConnect compact />
        </div>

        <button
          type="button"
          className="p-2 text-terminal md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-terminal bg-black px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 font-mono text-xs uppercase">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-dim hover:text-terminal"
                onClick={() => setOpen(false)}
              >
                {">"} {item.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-terminal pt-4">
              <TwitterConnect />
              <MetaMaskConnect />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
