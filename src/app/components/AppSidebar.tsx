"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import { useEffect, useState } from "react";

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
  const router = useRouter();
  const { user } = useFirebaseUser();
  const [signingOut, setSigningOut] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("theme");
    const nextDark = saved === "dark";
    setIsDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

function toggleTheme() {
  const next = !isDark;

  setIsDark(next);

  if (next) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}


  async function handleSignOut() {
    setSigningOut(true);
    try {
      if (auth && isFirebaseConfigured) {
        await signOut(auth);
      }
      router.push("/auth");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/6 bg-[#08090c] px-4 py-6 lg:flex lg:flex-col">
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
                  : "text-zinc-500 hover:bg-white/4 hover:text-zinc-200"
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

      <div className="mt-auto border-t border-white/6 pt-5">
        {user ? (
          <>
            <div className="flex items-center gap-3 rounded-lg px-2 py-3">
              <div className="h-9 w-9 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-semibold text-orange-400">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-orange-400">Synced</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full mt-3 rounded-lg border border-white/[0.07] px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/4 hover:text-zinc-200 disabled:opacity-50"
            >
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-zinc-600 mb-3">Local Mode</p>
            <Link
              href="/auth"
              className="block w-full rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-400 transition hover:bg-orange-500/15 text-center"
            >
              Sign In
            </Link>
          </>
        )}
        <div className="mt-4 flex items-center justify-between px-2 text-sm text-zinc-500">
          <span>Dark Mode</span>

          <button
            onClick={toggleTheme}
            className={`relative h-5 w-9 rounded-full p-0.5 transition-colors ${
              isDark ? "bg-orange-500" : "bg-zinc-600"
            }`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                isDark ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
