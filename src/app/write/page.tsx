"use client";

import React, { useEffect, useState } from "react";
import AppFrame from "../components/AppFrame";
import StoryEditor from "@/app/components/StoryEditor";
import { useFirebaseUser } from "@/lib/useFirebaseUser";

export default function WritePage() {
  const { user, loading } = useFirebaseUser();
  const [draft, setDraft] = useState<{ title?: string; content?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wf_story_draft");
      if (raw) setDraft(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AppFrame>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-zinc-100">Write</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {loading ? "Checking auth..." : user ? "Your drafts are saved to your account." : "Sign in to persist stories — drafts save locally."}
          </p>
        </header>

        <StoryEditor initialTitle={draft?.title} initialContent={draft?.content} />
      </div>
    </AppFrame>
  );
}
