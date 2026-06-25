"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { title: "Dashboard", href: "/", icon: "DB" },
  { title: "Stories", href: "/", icon: "ST" },
  { title: "Characters", href: "/characters", icon: "CH" },
  { title: "Scenes", href: "/scenes", icon: "SC" },
  { title: "Timeline", href: "/timeline", icon: "TL" },
  { title: "Outline", href: "/outline", icon: "OL" },
  { title: "Notes", href: "/", icon: "NT" },
  { title: "Settings", href: "/", icon: "SE" },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/[0.06] bg-[#08090c] px-4 py-6 lg:flex lg:flex-col">
      <Link href="/" className="flex items-center gap-3 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-lg text-orange-500">
          WF
        </span>
        <span className="text-base font-semibold text-zinc-100">
          Writer&apos;s Forge
        </span>
      </Link>

      <nav className="mt-14 space-y-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={`${item.title}-${item.href}`}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-orange-500/15 text-orange-400 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.16)]"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
              }`}
            >
              <span className="w-5 text-center text-[10px] font-semibold">
                {item.icon}
              </span>
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/[0.06] pt-5">
        <div className="flex items-center gap-3 rounded-lg px-2 py-3">
          <div className="h-9 w-9 rounded-full bg-zinc-800" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-200">
              Aregbesola .Bolu
            </p>
            <p className="text-xs text-zinc-600">Writer</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between px-2 text-sm text-zinc-500">
          <span>Dark Mode</span>
          <span className="h-5 w-9 rounded-full bg-orange-500 p-0.5">
            <span className="block h-4 w-4 translate-x-4 rounded-full bg-white" />
          </span>
        </div>
      </div>
    </aside>
  );
}
