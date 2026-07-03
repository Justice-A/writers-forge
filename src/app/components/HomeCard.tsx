"use client";

import Link from "next/link";

type HomeCardProps = {
  title: string;
  description: string;
  href: string;
  count?: number;
  lastAdded?: string | null;
};

export default function HomeCard({
  title,
  description,
  href,
  count,
  lastAdded,
}: HomeCardProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-white/[0.07] bg-[#0b0b0d] p-5 transition hover:-translate-y-0.5 hover:border-orange-500/35 hover:bg-[#101012] focus:outline-none focus:ring-2 focus:ring-orange-500/40"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-zinc-200">{count ?? 0}</div>
          <div className="mt-1 text-xs text-zinc-500">items</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-zinc-500">{lastAdded ?? "—"}</div>
        <div className="rounded-md border border-white/[0.08] px-2.5 py-1 text-xs font-semibold text-orange-400">
          Open
        </div>
      </div>
    </Link>
  );
}
