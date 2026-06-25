import AppFrame from "./components/AppFrame";
import FolderWidget from "./components/FolderWidget";

const folders = [
  {
    title: "Characters",
    description: "Develop cast profiles, motives, arcs, and relationships.",
    href: "/characters",
  },
  {
    title: "Scenes",
    description: "Collect draftable moments and track what each scene changes.",
    href: "/scenes",
  },
  {
    title: "Timeline",
    description: "Keep story events in order across chapters and timelines.",
    href: "/timeline",
  },
  {
    title: "Outline",
    description: "Shape acts, beats, chapters, and structural notes.",
    href: "/outline",
  },
];

export default function Home() {
  return (
    <AppFrame>
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-orange-500">
              Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              Writer&apos;s Forge
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              A quiet workspace for characters, scenes, timelines, and outlines.
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-[#08080a] px-4 py-2 text-sm text-zinc-500">
            Draft workspace
          </div>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {folders.map((folder) => (
            <FolderWidget key={folder.href} {...folder} />
          ))}
        </section>
      </div>
    </AppFrame>
  );
}
