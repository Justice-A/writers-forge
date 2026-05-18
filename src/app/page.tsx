"use client";

import FolderWidget from "@/components/FolderWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex">
      <aside className="w-64 bg-zinc-900 p-6 border-r border-zinc-800">
        <h1 className="text-2xl font-bold mb-10">
          Writer's Forge
        </h1>

        <nav className="flex flex-col gap-4">
          <button className="text-left hover:text-gray-400">
            Stories
          </button>

          <button className="text-left hover:text-gray-400">
            Notes
          </button>
        </nav>
      </aside>
      <section className="flex-1 p-10">
        <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Bolu's forge
        </h2>
        <h4>Your stories, organized.</h4>
        </div>
  
        <div className="grid grid-cols-2 gap-10">

           <FolderWidget
              title="Characters"
              description="Manage your story characters"
              href="/characters"
            />

            <FolderWidget
              title="Scenes"
              description="Organize your story scenes"
              href="/scenes"
            />    

            <FolderWidget
              title="Timeline"
              description="Track story chronology"
              href="/timeline"
            />

            <FolderWidget
              title="Outline"
              description="Structure your narrative"
              href="/outline"
            />

        </div>
      </section>
    </main>
  );
}