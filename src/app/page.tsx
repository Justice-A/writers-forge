"use client";

import HomeWorkspace from "./HomeWorkspace";
import AuthPage from "./auth/AuthPage";
import { useFirebaseUser } from "@/lib/useFirebaseUser";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading } = useFirebaseUser();
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    try {
      const g = localStorage.getItem("wf_guest");
      setGuest(Boolean(g));
    } catch {
      setGuest(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </main>
    );
  }

  return user || guest ? <HomeWorkspace /> : <AuthPage />;
}
