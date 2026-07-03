"use client";

import { FormEvent, useEffect, useState } from "react";
import AppFrame from "../components/AppFrame";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import {
  addItem,
  deleteItem,
  listenToItems,
  migrateLocalStorageToFirestore,
} from "@/lib/firestoreService";

type OutlineItem = { id: string; title: string };

export default function OutlineWorkspace() {
  const { user, loading: authLoading } = useFirebaseUser();
  const [items, setItems] = useState<OutlineItem[]>([]);
  const [title, setTitle] = useState("");
  const [migrationPrompted, setMigrationPrompted] = useState(false);

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("wf_outline");
      if (raw) {
        const data = JSON.parse(raw);
        setItems(data);
      }
    } catch (e) {}
  }, []);

  // Listen to Firestore if user is signed in
  useEffect(() => {
    if (!user || authLoading) return;

    const unsubscribe = listenToItems(
      user.uid,
      "outline",
      (firebaseItems) => {
        setItems(firebaseItems as OutlineItem[]);
      },
      (error) => {
        console.error("Failed to load outline from Firestore:", error);
      }
    );

    return unsubscribe;
  }, [user, authLoading]);

  // Offer migration from localStorage to Firestore on first sign-in
  useEffect(() => {
    if (!user || migrationPrompted) return;

    const localData = localStorage.getItem("wf_outline");
    if (localData) {
      const shouldMigrate = confirm(
        "Migrate your local outline to the cloud? Your data will sync across devices."
      );
      if (shouldMigrate) {
        migrateLocalStorageToFirestore(user.uid, "wf_outline", "outline")
          .then((result) => {
            if (result.success) {
              console.log(`Migrated ${result.migratedCount} outline items`);
            } else {
              console.error("Migration failed:", result.error);
            }
          });
      }
    }
    setMigrationPrompted(true);
  }, [user, migrationPrompted]);

  // Persist to localStorage if no user (offline mode)
  useEffect(() => {
    if (user) return;
    try {
      localStorage.setItem("wf_outline", JSON.stringify(items));
    } catch (e) {}
  }, [items, user]);

  async function addOutlineItem(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem = { title: title.trim() };

    if (user) {
      try {
        await addItem(user.uid, "outline", newItem);
      } catch (error) {
        console.error("Error adding outline item:", error);
      }
    } else {
      setItems((cur) => [{ id: String(Date.now()), ...newItem }, ...cur]);
    }
    setTitle("");
  }

  async function deleteOutlineItem(id: string) {
    if (!confirm("Delete this outline item?")) return;
    if (user) {
      try {
        await deleteItem(user.uid, "outline", id);
      } catch (error) {
        console.error("Error deleting outline item:", error);
      }
    } else {
      setItems((cur) => cur.filter((i) => i.id !== id));
    }
  }

  return (
    <AppFrame>
      <div className="mx-auto max-w-6xl">
        <header className="flex gap-4 items-center border-b border-white/[0.06] pb-6">
          <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-sm font-semibold text-orange-500">OL</div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">Outline</h1>
            <p className="mt-2 text-sm text-zinc-500">Build your story outline. {user ? `(Synced as ${user.email})` : "(Local mode)"}</p>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((it) => (
              <article key={it.id} className="rounded-xl border border-white/[0.07] bg-[#090a0d] p-4">
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-semibold text-zinc-100">{it.title}</h2>
                  </div>
                  <div className="flex gap-2 text-sm text-zinc-500">
                    <button onClick={() => deleteOutlineItem(it.id)} className="rounded-lg border border-orange-500/20 px-3 py-1 text-orange-400">Delete</button>
                  </div>
                </div>
              </article>
            ))}
            {items.length === 0 ? <div className="rounded-xl border border-dashed border-white/[0.1] p-8 text-center text-zinc-500">No outline items.</div> : null}
          </div>

          <aside className="rounded-xl border border-white/[0.07] bg-[#090a0d] p-4">
            <form onSubmit={addOutlineItem} className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Outline title" className="w-full rounded-lg border border-white/[0.07] bg-[#050506] px-4 py-2 text-sm text-zinc-100" />
              <button type="submit" className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">+ Add</button>
            </form>
          </aside>
        </section>
      </div>
    </AppFrame>
  );
}
