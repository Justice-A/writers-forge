"use client";

import { useEffect, useState } from "react";
import AppFrame from "./components/AppFrame";
import HomeCard from "./components/HomeCard";

type Counts = {
  characters: number;
  scenes: number;
  timeline: number;
  outline: number;
};

export default function HomeWorkspace() {
  const [counts, setCounts] = useState<Counts>({
    characters: 0,
    scenes: 0,
    timeline: 0,
    outline: 0,
  });

  useEffect(() => {
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
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    function handleStorage() {
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
      } catch (e) {
        // ignore
      }
    }

    // Listen for storage events (other tabs) and use a polling fallback
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <AppFrame>
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-orange-500">Dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">Writer's Forge</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">A focused workspace for characters, scenes, timelines, and outlines.</p>
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-[#08080a] px-4 py-2 text-sm text-zinc-500">Draft workspace</div>
        </header>

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
