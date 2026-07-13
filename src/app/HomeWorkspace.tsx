"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppFrame from "./components/AppFrame";
import HomeCard from "./components/HomeCard";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import { listenToItems } from "@/lib/firestoreService";

export default function HomeWorkspace() {
  const { user, loading: authLoading } = useFirebaseUser();
  const searchParams = useSearchParams();
  const router = useRouter();


  // Show welcome banner if arrived after signup
  useEffect(() => {
    const welcome = searchParams?.get?.("welcome");
    if (welcome) {
      const el = document.getElementById("wf-welcome-banner");
      if (el) el.style.display = "block";
      // hide after 4s and remove query param
      const t = setTimeout(() => {
        if (el) el.style.display = "none";
        try {
          router.replace(window.location.pathname);
        } catch {
          /* ignore */
        }
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [searchParams, router]);
      
  return (
    <AppFrame>
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mt-4 text-sm font-medium uppercase tracking-wide text-zinc-500">Dashboard</p>

          </div>
        </header>

        <div id="wf-welcome-banner" style={{ display: "none" }}>
          <div className="mt-6 rounded-lg bg-green-600/10 border border-green-600/20 p-3 text-green-200">
            Welcome to Writer's Forge!
          </div>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HomeCard
            title="Write"
            description="Draft your story in a focused editor"
            href="/write"
            light
          />
          <HomeCard
            title="Characters"
            description="Manage cast profiles and arcs"
            href="/characters"
          />
          <HomeCard
            title="Scenes"
            description="Draft and organize scenes"
            href="/scenes"
          />
          <HomeCard
            title="Timeline"
            description="Map story events across time"
            href="/timeline"
          />
          <HomeCard
            title="Outline"
            description="Build acts, beats, and chapters"
            href="/outline"
          />
        </section>
      </div>
    </AppFrame>
  );
}
