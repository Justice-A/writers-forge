"use client";

import React, { useEffect, useRef, useState } from "react";
import { addItem, updateItem } from "@/lib/firestoreService";
import { useFirebaseUser } from "@/lib/useFirebaseUser";

type Props = {
  initialId?: string;
  initialTitle?: string;
  initialContent?: string;
};

export default function StoryEditor({ initialId, initialTitle = "", initialContent = "" }: Props) {
  const { user } = useFirebaseUser();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [storyId, setStoryId] = useState<string | null>(initialId ?? null);
  const [saving, setSaving] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Persist draft locally immediately
  useEffect(() => {
    try {
      localStorage.setItem("wf_story_draft", JSON.stringify({ title, content, storyId }));
    } catch {
      /* ignore */
    }
  }, [title, content, storyId]);

  // Autosave to Firestore when signed in (debounced)
  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      if (!user) return;
      setSaving(true);
      try {
        if (storyId) {
          await updateItem(user.uid, "stories", storyId, { title, content });
        } else {
          const id = await addItem(user.uid, "stories", { title, content });
          setStoryId(id);
        }
      } catch (err) {
        console.error("Story save failed:", err);
      }
      setSaving(false);
    }, 1500) as unknown as number;

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [title, content, user, storyId]);

  async function handleManualSave() {
    if (!user) {
      try {
        localStorage.setItem("wf_story_draft", JSON.stringify({ title, content, storyId }));
      } catch {}
      return;
    }
    setSaving(true);
    try {
      if (storyId) {
        await updateItem(user.uid, "stories", storyId, { title, content });
      } else {
        const id = await addItem(user.uid, "stories", { title, content });
        setStoryId(id);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Story title"
          className="w-full rounded-md  bg-[#151518] px-3 py-2 text-zinc-100"
        />
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your story here..."
          rows={18}
          className="w-full rounded-md4 bg-[#151518] px-3 py-3 text-zinc-100"
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-zinc-400">{saving ? "Saving..." : "Saved"}</div>
        <div>
          <button
            onClick={handleManualSave}
            className="rounded bg-orange-500 px-3 py-1 text-sm text-white"
          >
            Save Now
          </button>
        </div>
      </div>
    </div>
  );
}
