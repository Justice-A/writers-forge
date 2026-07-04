"use client";

import { useState } from "react";

type Props = {
  type: "characters" | "scenes" | "timeline" | "outline";
  items: unknown[];
};

export default function AiAssistant({ type, items }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const resp = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, items }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error || "AI request failed");
      } else {
        setResult(data.result || JSON.stringify(data));
      }
    } catch (err) {
      setError("Request failed. Check server and API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={run}
        disabled={loading}
        className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate with AI"}
      </button>

      {error ? (
        <div className="mt-2 text-sm text-red-400">{error}</div>
      ) : null}

      {result ? (
        <pre className="mt-3 max-h-60 overflow-auto rounded-md bg-[#050506] p-3 text-xs text-zinc-200">{result}</pre>
      ) : null}
    </div>
  );
}
