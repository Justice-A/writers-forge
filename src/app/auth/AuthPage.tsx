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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function handleGuestContinue() {
    setError("");
    setSubmitting(true);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("wf_guest", "1");
        sessionStorage.setItem("wf_guest", "1");
      }
      router.replace("/");
      router.refresh();
    } catch {
      router.replace("/");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!auth || !isFirebaseConfigured) {
      setError("Firebase authentication is not ready yet. Please check your Firebase config and try again.");
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
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = credential.user;

        if (newUser.uid) {
          await upsertUserProfile(newUser.uid, {
            email: newUser.email ?? null,
            displayName: newUser.displayName ?? null,
            photoURL: newUser.photoURL ?? null,
            provider: "password",
          });
        }

        router.push("/?welcome=1");
        return;
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // On success, show a brief welcome message before the dashboard
      router.push("/?welcome=1");
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
      setError("Firebase authentication is not ready yet. Please check your Firebase config and try again.");
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

      router.push("/?welcome=1");
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-white/7 bg-[#050506] px-4 py-2 pr-11 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-400 transition hover:text-zinc-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A2 2 0 0013.42 13.42" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.1A10.7 10.7 0 0112 5c4.6 0 8.4 2.6 10 7-.8 1.9-2 3.6-3.6 4.9" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A10.9 10.9 0 002 12c1.6 4.4 5.4 7 10 7 1.5 0 2.9-.3 4.2-.8" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-white/7 bg-[#050506] px-4 py-2 pr-11 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute inset-y-0 right-3 flex items-center text-zinc-400 transition hover:text-zinc-200"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A2 2 0 0013.42 13.42" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.1A10.7 10.7 0 0112 5c4.6 0 8.4 2.6 10 7-.8 1.9-2 3.6-3.6 4.9" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A10.9 10.9 0 002 12c1.6 4.4 5.4 7 10 7 1.5 0 2.9-.3 4.2-.8" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
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
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                title="Continue with Google"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/8 bg-white/5 text-zinc-100 transition hover:bg-white/10 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-label="Google logo">
                  <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.6l6.6-6.6C34.4 3 29.5 1 24 1 14.8 1 7.1 6.2 3.9 13.9l7.7 6c2.2-6.4 8.3-11.4 12.4-11.4Z" />
                  <path fill="#4285F4" d="M45.8 24c0-1.6-.2-3.2-.5-4.7H24v8.9h12.4c-.5 2.8-2.1 5.1-4.5 6.7v5.5h7.2c4.2-3.9 6.7-9.6 6.7-16.4Z" />
                  <path fill="#FBBC05" d="M11.6 19.9 3.9 13.9A23.4 23.4 0 0 0 1.6 24c0 3.8.9 7.4 2.5 10.6l7.7-6c-1.1-3.1-1.1-6.5 0-9.7Z" />
                  <path fill="#34A853" d="M24 46c6.2 0 11.4-2 15.2-5.4l-7.2-5.5c-2 1.3-4.5 2.1-8 2.1-6.1 0-11.3-4.1-13.2-9.7l-7.7 6C7.1 41.8 14.8 46 24 46Z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-zinc-500">
            <button
              type="button"
              onClick={handleGuestContinue}
              disabled={submitting}
              className="text-orange-400 transition hover:text-orange-300 disabled:opacity-50"
            >
              Continue as guest →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
