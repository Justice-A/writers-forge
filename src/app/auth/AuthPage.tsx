"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useFirebaseUser();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!auth || !isFirebaseConfigured) {
      setError("Firebase is not configured yet. You can continue in local mode.");
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setSubmitting(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      // On success, redirect to home
      router.push("/");
    } catch (err: unknown) {
      console.error("Auth error:", err);
      const message = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030303] px-4 py-10 text-zinc-100">
      {loading ? (
        <div className="text-center">
          <p className="text-zinc-400">Loading...</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-lg text-orange-500">
                WF
              </span>
              <span className="text-2xl font-semibold">Writer&apos;s Forge</span>
            </div>
            <p className="text-sm text-zinc-500">
              A focused workspace for writers.
            </p>
          </div>

          <div className="rounded-lg border border-white/7 bg-[#0b0b0d] p-6">
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  mode === "signin"
                    ? "border border-orange-500/30 bg-orange-500/15 text-orange-400"
                    : "border border-white/7 bg-[#050506] text-zinc-500 hover:text-zinc-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  mode === "signup"
                    ? "border border-orange-500/30 bg-orange-500/15 text-orange-400"
                    : "border border-white/7 bg-[#050506] text-zinc-500 hover:text-zinc-200"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-lg border border-white/7 bg-[#050506] px-4 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-white/7 bg-[#050506] px-4 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-white/7 bg-[#050506] px-4 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 rounded-lg border border-white/7 bg-[#050506] p-4">
              <p className="text-center text-xs text-zinc-500">
                Local mode: sign in or continue without an account to keep your
                work stored locally.
              </p>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-zinc-500">
            <Link href="/" className="text-orange-400 hover:text-orange-300">
              Continue without account →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
