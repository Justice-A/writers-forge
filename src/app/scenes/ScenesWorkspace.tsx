"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import AppFrame from "../components/AppFrame";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import {
  addItem,
  deleteItem,
  updateItem,
  listenToItems,
  migrateLocalStorageToFirestore,
} from "@/lib/firestoreService";

type Item = { id: string; title: string; notes: string; added: string };

const defaultItems: Item[] = [];

export default function ScenesWorkspace() {
  const { user, loading: authLoading } = useFirebaseUser();
  const [items, setItems] = useState<Item[]>(() => {
    if (typeof window === "undefined") return defaultItems;
    try {
      const raw = localStorage.getItem("wf_scenes");
      if (!raw) return defaultItems;
      const data = JSON.parse(raw);
      return Array.isArray(data) ? (data as Item[]) : defaultItems;
    } catch {
      return defaultItems;
    }
  });
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const migrationPromptedRef = useRef(false);

  // Listen to Firestore if user is signed in
  useEffect(() => {
    if (!user || authLoading) return;

    const unsubscribe = listenToItems(
      user.uid,
      "scenes",
      (firebaseItems) => {
        setItems(firebaseItems as Item[]);
      },
      (error) => {
        console.error("Failed to load scenes from Firestore:", error);
      }
    );

    return unsubscribe;
  }, [user, authLoading]);

  // Migrate local data to Firestore on first sign-in without interrupting the user.
  useEffect(() => {
    if (!user || migrationPromptedRef.current) return;

    migrationPromptedRef.current = true;
    const localData = localStorage.getItem("wf_scenes");
    if (localData) {
      void migrateLocalStorageToFirestore(user.uid, "wf_scenes", "scenes")
        .then((result) => {
          if (result.success) {
            console.log(`Migrated ${result.migratedCount} scenes`);
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
      localStorage.setItem("wf_scenes", JSON.stringify(items));
    } catch {}
  }, [items, user]);

  async function addItem_(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem = {
      title: title.trim(),
      notes: notes.trim() || "",
      added: "Today",
    };

    if (user) {
      try {
        await addItem(user.uid, "scenes", newItem);
      } catch (error) {
        console.error("Error adding scene:", error);
      }
    } else {
      setItems((cur) => [
        { id: String(Date.now()), ...newItem },
        ...cur,
      ]);
    }
    setTitle("");
    setNotes("");
  }

  async function deleteItem_(id: string) {
    if (!confirm("Delete this scene?")) return;
    if (user) {
      try {
        await deleteItem(user.uid, "scenes", id);
      } catch (error) {
        console.error("Error deleting scene:", error);
      }
    } else {
      setItems((cur) => cur.filter((i) => i.id !== id));
    }
  }

  async function editItem_(id: string) {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    const newTitle = prompt("Title", it.title)?.trim();
    const newNotes = prompt("Notes", it.notes)?.trim();
    if (!newTitle) return;

    if (user) {
      try {
        await updateItem(user.uid, "scenes", id, {
          title: newTitle,
          notes: newNotes || "",
        });
      } catch (error) {
        console.error("Error updating scene:", error);
      }
    } else {
      setItems((cur) =>
        cur.map((c) => (c.id === id ? { ...c, title: newTitle, notes: newNotes || "" } : c))
      );
    }
  }

  return (
    <AppFrame>
      <div className="mx-auto max-w-6xl">
        <header className="flex gap-4 items-center border-b border-white/6 pb-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">Scenes</h1>
            <p className="mt-2 text-sm text-zinc-500">Create and manage your scenes</p>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((it) => (
              <article key={it.id} className="rounded-xl border border-white/[0.07] bg-[#090a0d] p-4">
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-semibold text-zinc-100">{it.title}</h2>
                    <p className="mt-2 text-sm text-zinc-500">{it.notes}</p>
                  </div>
                  <div className="flex gap-2 text-sm text-zinc-500">
                    <button onClick={() => editItem_(it.id)} className="rounded-lg border border-white/[0.07] px-3 py-1">Edit</button>
                    <button onClick={() => deleteItem_(it.id)} className="rounded-lg border border-orange-500/20 px-3 py-1 text-orange-400">Delete</button>
                  </div>
                </div>
              </article>
            ))}
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-zinc-500">No scenes yet.</div>
            ) : null}
          </div>

          <aside className="rounded-xl border border-white/[0.07] bg-[#090a0d] p-4">
            <form onSubmit={addItem_} className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Scene title" className="w-full rounded-lg border border-white/[0.07] bg-[#050506] px-4 py-2 text-sm text-zinc-100" />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Notes" className="w-full rounded-lg border border-white/[0.07] bg-[#050506] px-4 py-2 text-sm text-zinc-100" />
              <button type="submit" className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">+ Add Scene</button>
            </form>
          </aside>
        </section>
      </div>
    </AppFrame>
  );
}
