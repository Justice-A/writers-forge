"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import AppSidebar from "./AppSidebar";

type AppFrameProps = {
  children: React.ReactNode;
};

const mobileNavItems = [
  { title: "Dashboard", href: "/" },
  { title: "Write", href: "/write" },
  { title: "Characters", href: "/characters" },
  { title: "Scenes", href: "/scenes" },
  { title: "Timeline", href: "/timeline" },
  { title: "Outline", href: "/outline" },
];

export default function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useFirebaseUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
    <main className="min-h-screen bg-[#030303] text-zinc-100">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-[#030303]/95 px-4 py-3 backdrop-blur lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-sm font-semibold text-orange-500">
                WF
              </span>
              <span className="text-sm font-semibold text-zinc-100">Writer&apos;s Forge</span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-200"
              aria-label="Toggle navigation"
            >
              ☰
            </button>
          </header>

          <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10">
            {children}
          </section>
        </div>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          />

          <div className="fixed right-0 top-0 z-40 flex h-full w-72 max-w-[85vw] flex-col border-l border-white/8 bg-[#08090c] p-5 shadow-2xl lg:hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-100">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-white/10 px-2 py-1 text-sm text-zinc-400"
              >
                Close
              </button>
            </div>

            <nav className="mt-6 space-y-2">
              {mobileNavItems.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-orange-500/15 text-orange-400"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-white/8 pt-5">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  {signingOut ? "Signing out..." : "Log out"}
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="block w-full rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-center text-sm font-medium text-orange-400"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
