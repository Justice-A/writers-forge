import AppFrame from "../components/AppFrame";

export default function OutlinePage() {
  return (
    <AppFrame>
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-wide text-orange-500">
          Writer&apos;s Forge
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-100">
          Outline
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-500">
          Outline building workspace coming next.
        </p>
      </section>
    </AppFrame>
  );
}
