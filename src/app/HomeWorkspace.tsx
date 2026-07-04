"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppFrame from "./components/AppFrame";
import HomeCard from "./components/HomeCard";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import { listenToItems } from "@/lib/firestoreService";

type Counts = {
  characters: number;
  scenes: number;
  timeline: number;
  outline: number;
};

export default function HomeWorkspace() {
  const { user, loading: authLoading } = useFirebaseUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [counts, setCounts] = useState<Counts>({
    characters: 0,
    scenes: 0,
    timeline: 0,
    outline: 0,
  });

  useEffect(() => {
    function readCountsFromStorage() {
      try {
        const chars = JSON.parse(localStorage.getItem("wf_characters") || "null");
        const scenes = JSON.parse(localStorage.getItem("wf_scenes") || "null");
        const timeline = JSON.parse(localStorage.getItem("wf_timeline") || "null");
        const outline = JSON.parse(localStorage.getItem("wf_outline") || "null");

        setCounts({
          characters: Array.isArray(chars) ? chars.length : 0,
          scenes: Array.isArray(scenes) ? scenes.length : 0,
          timeline: Array.isArray(timeline) ? timeline.length : 0,
          outline: Array.isArray(outline) ? outline.length : 0,
        });
      } catch {
        setCounts({ characters: 0, scenes: 0, timeline: 0, outline: 0 });
      }
    }

    if (authLoading) return;

    if (user) {
      const unsubscribeCharacters = listenToItems(
        user.uid,
        "characters",
        (items) => setCounts((current) => ({ ...current, characters: items.length })),
        () => undefined
      );
      const unsubscribeScenes = listenToItems(
        user.uid,
        "scenes",
        (items) => setCounts((current) => ({ ...current, scenes: items.length })),
        () => undefined
      );
      const unsubscribeTimeline = listenToItems(
        user.uid,
        "timeline",
        (items) => setCounts((current) => ({ ...current, timeline: items.length })),
        () => undefined
      );
      const unsubscribeOutline = listenToItems(
        user.uid,
        "outline",
        (items) => setCounts((current) => ({ ...current, outline: items.length })),
        () => undefined
      );

      return () => {
        unsubscribeCharacters();
        unsubscribeScenes();
        unsubscribeTimeline();
        unsubscribeOutline();
      };
    }

    readCountsFromStorage();

    const handleStorage = () => readCountsFromStorage();
    window.addEventListener("storage", handleStorage);

    const interval = window.setInterval(readCountsFromStorage, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(interval);
    };
  }, [user, authLoading]);

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
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [searchParams, router]);

  return (
    <AppFrame>
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-orange-500">Dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">Writer&apos;s Forge</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">A focused workspace for creating a story.</p>
          </div>
        </header>

        <div id="wf-welcome-banner" style={{ display: "none" }}>
          <div className="mt-6 rounded-lg bg-green-600/10 border border-green-600/20 p-3 text-green-200">
            Welcome to Writer's Forge — your dashboard is ready!
          </div>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HomeCard
            title="Characters"
            description="Manage cast profiles and arcs"
            href="/characters"
            count={counts.characters}
            lastAdded={counts.characters ? "Recently" : null}
          />
          <HomeCard
            title="Scenes"
            description="Draft and organize scenes"
            href="/scenes"
            count={counts.scenes}
            lastAdded={counts.scenes ? "Recently" : null}
          />
          <HomeCard
            title="Timeline"
            description="Map story events across time"
            href="/timeline"
            count={counts.timeline}
            lastAdded={counts.timeline ? "Recently" : null}
          />
          <HomeCard
            title="Outline"
            description="Build acts, beats, and chapters"
            href="/outline"
            count={counts.outline}
            lastAdded={counts.outline ? "Recently" : null}
          />
        </section>
      </div>
    </AppFrame>
  );
}
