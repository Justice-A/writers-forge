"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AppFrame from "../components/AppFrame";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import {
  addItem,
  deleteItem,
  updateItem,
  listenToItems,
  migrateLocalStorageToFirestore,
} from "@/lib/firestoreService";

type CharacterType = "Protagonist" | "Antagonist" | "Supporting";

type Character = {
  id: string;
  name: string;
  role: string;
  notes: string;
  type: CharacterType;
  traits: string[];
  added: string;
  createdAt?: string;
  updatedAt?: string;
};

const filters = ["All Characters", "Protagonists", "Antagonists", "Supporting"];

function sanitizeCharacters(items: Character[]) {
  return items.filter((character) => {
    const normalizedName = character.name?.trim();
    return;
  });
}

function matchesFilter(character: Character, activeFilter: string) {
  return (
    activeFilter === "All Characters" ||
    `${character.type}s` === activeFilter ||
    character.type === activeFilter
  );
}

function CharacterCard({
  character,
  onEdit,
  onDelete,
}: {
  character: Character;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="grid gap-5 rounded-xl border border-white/[0.07] bg-[#090a0d] p-5 transition hover:border-white/10 md:grid-cols-[1fr_170px]">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-zinc-100">
            {character.name}
          </h2>
          {character.type === "Protagonist" ? (
            <span className="text-orange-500">*</span>
          ) : null}
        </div>
        <p className="mt-2 text-sm font-semibold text-orange-400">
          {character.role}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
          {character.notes}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {character.traits.map((trait) => (
            <span
              key={trait}
              className="rounded-md bg-white/4 px-2.5 py-1 text-xs text-zinc-400"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between border-white/[0.07] text-sm text-zinc-500 md:border-l md:pl-6">
        <div>
          <p className="text-xs text-zinc-600">Added</p>
          <p className="mt-1">{character.added}</p>
        </div>
          <div className="flex gap-2">
          <button onClick={() => onEdit(character.id)} className="rounded-lg border border-white/[0.07] px-3 py-2 text-zinc-400 transition hover:border-orange-500/40 hover:text-orange-400">
            Edit
          </button>
          <button onClick={() => onDelete(character.id)} className="rounded-lg border border-orange-500/20 px-3 py-2 text-orange-500/80 transition hover:bg-orange-500/10">
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CharactersWorkspace() {
  const { user, loading: authLoading } = useFirebaseUser();
  const [characters, setCharacters] = useState<Character[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("wf_characters");
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? sanitizeCharacters(data as Character[]) : [];
    } catch {
      return [];
    }
  });
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Characters");
  const migrationPromptedRef = useRef(false);

  // Listen to Firestore if user is signed in
  useEffect(() => {
    if (!user || authLoading) return;

    const unsubscribe = listenToItems(
      user.uid,
      "characters",
      (items) => {
        setCharacters(sanitizeCharacters(items as Character[]));
      },
      (error) => {
        console.error("Failed to load characters from Firestore:", error);
      }
    );

    return unsubscribe;
  }, [user, authLoading]);

  // Migrate local data to Firestore on first sign-in without interrupting the user.
  useEffect(() => {
    if (!user || migrationPromptedRef.current) return;

    migrationPromptedRef.current = true;
    const localData = localStorage.getItem("wf_characters");
    if (localData) {
      void migrateLocalStorageToFirestore(user.uid, "wf_characters", "characters")
        .then((result) => {
          if (result.success) {
            console.log(`Migrated ${result.migratedCount} characters`);
          } else {
            console.error("Migration failed:", result.error);
          }
        });
    }
  }, [user]);

  // Persist to localStorage if no user (offline mode)
  useEffect(() => {
    if (user) return; // Don't persist to localStorage when using Firestore
    try {
      localStorage.setItem("wf_characters", JSON.stringify(sanitizeCharacters(characters)));
    } catch {
      // ignore
    }
  }, [characters, user]);

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return characters.filter((character) => {
      const searchableText = [
        character.name,
        character.role,
        character.notes,
        ...character.traits,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesFilter(character, activeFilter) &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      );
    });
  }, [activeFilter, characters, query]);

  async function addCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const trimmedName = String(formData.get("name") ?? "").trim();
    const trimmedRole = String(formData.get("role") ?? "").trim();
    const trimmedNotes = String(formData.get("notes") ?? "").trim();

    if (!trimmedName || !trimmedRole) {
      setFormError("Add a name and role before saving a character.");
      return;
    }

    const newCharacter = {
      name: trimmedName,
      role: trimmedRole,
      notes: trimmedNotes || "No notes yet.",
      type: "Supporting" as CharacterType,
      traits: ["New"],
      added: "Today",
    };

    if (user) {
      // Add to Firestore
      try {
        await addItem(user.uid, "characters", newCharacter);
      } catch (error) {
        console.error("Error adding character:", error);
        setFormError("Failed to save character. Please try again.");
        return;
      }
    } else {
      // Add to localStorage only
      setCharacters((currentCharacters) => [
        {
          id: String(Date.now()),
          ...newCharacter,
        },
        ...currentCharacters,
      ]);
    }

    setName("");
    setRole("");
    setNotes("");
    setFormError("");
  }

  async function deleteCharacter(id: string) {
    if (!confirm("Delete this character?")) return;

    if (user) {
      try {
        await deleteItem(user.uid, "characters", id);
      } catch (error) {
        console.error("Error deleting character:", error);
      }
    } else {
      setCharacters((current) => current.filter((c) => c.id !== id));
    }
  }

  async function editCharacter(id: string) {
    const target = characters.find((c) => c.id === id);
    if (!target) return;
    const newName = prompt("Name", target.name)?.trim();
    const newRole = prompt("Role", target.role)?.trim();
    if (!newName || !newRole) return;

    if (user) {
      try {
        await updateItem(user.uid, "characters", id, {
          name: newName,
          role: newRole,
        });
      } catch (error) {
        console.error("Error updating character:", error);
      }
    } else {
      setCharacters((current) =>
        current.map((c) =>
          c.id === id ? { ...c, name: newName, role: newRole } : c
        )
      );
    }
  }

  return (
    <AppFrame>
      <div className="mx-auto max-w-6xl">
        <header className="grid gap-6 border-b border-white/6 pb-7 xl:grid-cols-[1fr_360px]">
          <div className="flex gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">
                Characters
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Create and manage your story characters
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/[0.07] bg-[#090a0d] p-4">
            <label className="block">
              <span className="sr-only">Search characters</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search characters..."
                className="w-full rounded-lg border border-white/[0.07] bg-[#050506] px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
              />
            </label>

            <form onSubmit={addCharacter} className="space-y-3">
              <input
                name="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setFormError("");
                }}
                placeholder="Character Name"
                className="w-full rounded-lg border border-white/[0.07] bg-[#050506] px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
              />
              <input
                name="role"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setFormError("");
                }}
                placeholder="Role"
                className="w-full rounded-lg border border-white/[0.07] bg-[#050506] px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
              />
              <textarea
                name="notes"
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setFormError("");
                }}
                placeholder="Short note"
                rows={3}
                className="w-full resize-none rounded-lg border border-white/[0.07] bg-[#050506] px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
              />
              {formError ? (
                <p className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-sm text-orange-200">
                  {formError}
                </p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                + Add Character
              </button>
            </form>
        
          </div>
        </header>

        <section className="mt-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-lg border px-4 py-2 text-sm transition ${
                  activeFilter === filter
                    ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                    : "border-white/[0.07] bg-[#090a0d] text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 space-y-4">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onEdit={editCharacter}
              onDelete={deleteCharacter}
            />
          ))}
          {filteredCharacters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
              No characters match your search
            </div>
          ) : null}
        </section>
      </div>
    </AppFrame>
  );
}
