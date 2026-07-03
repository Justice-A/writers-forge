"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import AppFrame from "../components/AppFrame";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import {
  addItem,
  deleteItem,
  listenToItems,
  migrateLocalStorageToFirestore,
} from "@/lib/firestoreService";

type EventItem = { id: string; title: string; date?: string };

export default function TimelineWorkspace() {
  const { user, loading: authLoading } = useFirebaseUser();
  const [items, setItems] = useState<EventItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("wf_timeline");
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? (data as EventItem[]) : [];
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const migrationPromptedRef = useRef(false);

  // Listen to Firestore if user is signed in
  useEffect(() => {
    if (!user || authLoading) return;

    const unsubscribe = listenToItems(
      user.uid,
      "timeline",
      (firebaseItems) => {
        setItems(firebaseItems as EventItem[]);
      },
      (error) => {
        console.error("Failed to load timeline from Firestore:", error);
      }
    );

    return unsubscribe;
  }, [user, authLoading]);

  // Migrate local data to Firestore on first sign-in without interrupting the user.
  useEffect(() => {
    if (!user || migrationPromptedRef.current) return;

    migrationPromptedRef.current = true;
    const localData = localStorage.getItem("wf_timeline");
    if (localData) {
      void migrateLocalStorageToFirestore(user.uid, "wf_timeline", "timeline")
        .then((result) => {
          if (result.success) {
            console.log(`Migrated ${result.migratedCount} timeline events`);
          } else {
            console.error("Migration failed:", result.error);
          }
        });
    }
  }, [user]);

  // Persist to localStorage if no user (offline mode)
  useEffect(() => {
    if (user) return;
    try {
      localStorage.setItem("wf_timeline", JSON.stringify(items));
    } catch {}
  }, [items, user]);

  async function addEvent(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent = { title: title.trim(), date: date || undefined };

    if (user) {
      try {
        await addItem(user.uid, "timeline", newEvent);
      } catch (error) {
        console.error("Error adding timeline event:", error);
      }
    } else {
      setItems((cur) => [{ id: String(Date.now()), ...newEvent }, ...cur]);
    }
    setTitle("");
    setDate("");
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    if (user) {
      try {
        await deleteItem(user.uid, "timeline", id);
      } catch (error) {
        console.error("Error deleting timeline event:", error);
      }
    } else {
      setItems((cur) => cur.filter((i) => i.id !== id));
    }
  }

  return (
    <AppFrame>
      <div className="mx-auto max-w-6xl">
        <header className="flex gap-4 items-center border-b border-white/6 pb-6">
          <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-sm font-semibold text-orange-500">TL</div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">Timeline</h1>
            <p className="mt-2 text-sm text-zinc-500">Map story events over time. {user ? `(Synced as ${user.email})` : "(Local mode)"}</p>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((it) => (
              <article key={it.id} className="rounded-xl border border-white/[0.07] bg-[#090a0d] p-4">
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-semibold text-zinc-100">{it.title}</h2>
                    <p className="mt-1 text-xs text-zinc-500">{it.date}</p>
                  </div>
                  <div className="flex gap-2 text-sm text-zinc-500">
                    <button onClick={() => deleteEvent(it.id)} className="rounded-lg border border-orange-500/20 px-3 py-1 text-orange-400">Delete</button>
                  </div>
                </div>
              </article>
            ))}
            {items.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-zinc-500">No timeline events.</div> : null}
          </div>

          <aside className="rounded-xl border border-white/[0.07] bg-[#090a0d] p-4">
            <form onSubmit={addEvent} className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="w-full rounded-lg border border-white/[0.07] bg-[#050506] px-4 py-2 text-sm text-zinc-100" />
              <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date" className="w-full rounded-lg border border-white/[0.07] bg-[#050506] px-4 py-2 text-sm text-zinc-100" />
              <button type="submit" className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">+ Add Event</button>
            </form>
          </aside>
        </section>
      </div>
    </AppFrame>
  );
}
