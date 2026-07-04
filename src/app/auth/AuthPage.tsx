"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { upsertUserProfile } from "@/lib/firestoreService";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useFirebaseUser();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
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
        // redirect with welcome flag so dashboard can show a welcome message
        router.push("/?welcome=1");
        return;
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // On success, redirect to home
      router.push("/");
    } catch (err: unknown) {
      console.error("Auth error:", err);
      // Friendly mapping for common Firebase auth errors
      const code = (err as any)?.code as string | undefined;
      if (code) {
        switch (code) {
          case 'auth/email-already-in-use':
            setError('This email is already in use. Try signing in.');
            break;
          case 'auth/invalid-email':
            setError('Please provide a valid email address.');
            break;
          case 'auth/weak-password':
            setError('Password is too weak. Use at least 6 characters.');
            break;
          case 'auth/user-not-found':
            setError('No account found with this email.');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password.');
            break;
          default:
            setError('Unable to complete authentication. Please try again.');
        }
      } else {
        setError('Unable to complete authentication. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Handle redirect results (for fallback when popup is blocked)
  useEffect(() => {
    async function handleRedirect() {
      if (!auth || !isFirebaseConfigured) return;
      try {
        const result = await getRedirectResult(auth);
        const u = result?.user;
        if (u && u.uid) {
          await upsertUserProfile(u.uid, {
            email: u.email ?? null,
            displayName: u.displayName ?? null,
            photoURL: u.photoURL ?? null,
            provider: (result as any)?.providerId ?? null,
          });
          router.push("/?welcome=1");
        }
      } catch (err) {
        console.error('Redirect sign-in error:', err);
      }
    }
    handleRedirect();
  }, [router]);

  async function handleGoogleSignIn() {
    setError("");
    setSubmitting(true);

    if (!auth || !isFirebaseConfigured) {
      setError("Firebase is not configured yet. You can continue in local mode.");
      setSubmitting(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;

      // Save basic profile to Firestore for easy lookup / migration
      if (u && u.uid) {
        await upsertUserProfile(u.uid, {
          email: u.email ?? null,
          displayName: u.displayName ?? null,
          photoURL: u.photoURL ?? null,
          provider: provider.providerId,
        });
      }

      const isNew = (result as any)?.additionalUserInfo?.isNewUser;
      router.push(isNew ? "/?welcome=1" : "/");
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const code = (err as any)?.code as string | undefined;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Google sign-in was cancelled. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup blocked. Allow popups and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      }
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
            <p className="text-sm text-zinc-500">A focused workspace for writers.</p>
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
                <label className="mb-2 block text-sm font-medium text-zinc-300">Email</label>
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
                <label className="mb-2 block text-sm font-medium text-zinc-300">Password</label>
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
                  <label className="mb-2 block text-sm font-medium text-zinc-300">Confirm Password</label>
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
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={submitting}
                title="Continue with Google"
                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/8 bg-white/5 text-zinc-100 transition hover:bg-white/10 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" fill="none">
                  <path fill="#EA4335" d="M24 9.5c3.7 0 6.3 1.6 7.8 2.9l5.7-5.6C34.7 3.7 29.9 1.5 24 1.5 14.9 1.5 7.4 6.9 4 14.2l6.6 5.1C12.6 14.2 17.7 9.5 24 9.5z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-zinc-500">
            <button
              onClick={() => {
                try {
                  localStorage.setItem('wf_guest', '1');
                } catch {}
                router.push('/');
              }}
              className="text-orange-400 hover:text-orange-300"
            >
              Continue as guest →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
