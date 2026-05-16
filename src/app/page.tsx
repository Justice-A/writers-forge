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
        <h2 className="text-4xl font-bold mb-2">
          Dashboard
        </h2>
        <h4>Your stories, organized.</h4>
        </div>
        <div className="grid grid-cols-2 gap-10">

          {/* CHARACTERS */}
          <div className="relative h-60 rounded-[2rem] bg-linear-to-b from-[#3b3b3b] to-[#161616] shadow-[0_20px_30px_rgba(0,0,0,0.2)] overflow-hidden">

            {/* BACK PAPER */}
            <div className="absolute top-8 left-20 w-36 h-32 bg-[#c7c5c5] rounded-[1.5rem] rotate-2 shadow-md">
              <div className="p-4 space-y-3">
                <div className="h-2 bg-black/10 rounded-full w-24"></div>
                <div className="h-2 bg-black/10 rounded-full w-20"></div>
                <div className="h-2 bg-black/10 rounded-full w-16"></div>
              </div>
            </div>

            {/* FRONT PAPER */}
            <div className="absolute top-12 left-8 w-44 h-36 bg-[#696969] rounded-3xl rotate-[-8deg] shadow-xl">
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-2 bg-black/10 rounded-full w-28"></div>
                  <div className="h-2 bg-black/10 rounded-full w-24"></div>
                  <div className="h-2 bg-black/10 rounded-full w-20"></div>
                  <div className="h-2 bg-black/10 rounded-full w-16"></div>
                </div>
              </div>
            </div>

            {/* GLASS PANEL */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-black/10 backdrop-blur-xl border border-white/10 rounded-t-[2rem]">

              {/* GLASS SHINE */}
              <div className="absolute inset-0 bg-linear-to-r from-white/20 via-transparent to-transparent opacity-30"></div>

            </div>

            {/* TITLE */}
            <div className="absolute bottom-6 left-6 z-20">
              <h3 className="text-xl font-bold text-white">
                Characters
              </h3>

              <p className="text-white/60 mt-1 text-sm">
                Manage your story characters
              </p>
            </div>
          </div>
          
          {/* SCENES */}
          <div className="relative h-60 rounded-[2rem] bg-linear-to-b from-[#3b3b3b] to-[#161616] shadow-[0_20px_30px_rgba(0,0,0,0.2)] overflow-hidden">

            <div className="absolute top-8 left-20 w-36 h-32 bg-[#f4f4f4] rounded-[1.5rem] rotate-2 shadow-md">
              <div className="p-4 space-y-3">
                <div className="h-2 bg-black/10 rounded-full w-24"></div>
                <div className="h-2 bg-black/10 rounded-full w-20"></div>
                <div className="h-2 bg-black/10 rounded-full w-16"></div>
              </div>
            </div>

            <div className="absolute top-12 left-8 w-44 h-36 bg-[#696969] rounded-3xl rotate-[-8deg] shadow-xl">
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-2 bg-black/10 rounded-full w-28"></div>
                  <div className="h-2 bg-black/10 rounded-full w-24"></div>
                  <div className="h-2 bg-black/10 rounded-full w-20"></div>
                  <div className="h-2 bg-black/10 rounded-full w-16"></div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-black/10 backdrop-blur-xl border border-white/10 rounded-t-[2rem]">
              <div className="absolute inset-0 bg-linear-to-r from-white/20 via-transparent to-transparent opacity-30"></div>
            </div>

            <div className="absolute bottom-6 left-6 z-20">
              <h3 className="text-xl font-bold text-white">
                Scenes
              </h3>

              <p className="text-white/60 mt-1 text-sm">
                Organize your story scenes
              </p>
            </div>

          </div>

          {/* TIMELINE */}
          <div className="relative h-60 rounded-[2rem] bg-linear-to-b from-[#3b3b3b] to-[#161616] shadow-[0_20px_30px_rgba(0,0,0,0.2)] overflow-hidden">

            <div className="absolute top-8 left-20 w-36 h-32 bg-[#f4f4f4] rounded-[1.5rem] rotate-2 shadow-md">
              <div className="p-4 space-y-3">
                <div className="h-2 bg-black/10 rounded-full w-24"></div>
                <div className="h-2 bg-black/10 rounded-full w-20"></div>
                <div className="h-2 bg-black/10 rounded-full w-16"></div>
              </div>
            </div>

            <div className="absolute top-12 left-8 w-44 h-36 bg-[#696969] rounded-3xl rotate-[-8deg] shadow-xl">
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-2 bg-black/10 rounded-full w-28"></div>
                  <div className="h-2 bg-black/10 rounded-full w-24"></div>
                  <div className="h-2 bg-black/10 rounded-full w-20"></div>
                  <div className="h-2 bg-black/10 rounded-full w-16"></div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-black/20 backdrop-blur-xl border border-white/10 rounded-t-[2rem]">
              <div className="absolute inset-0 bg-linear-to-r from-white/10 via-transparent to-transparent opacity-20"></div>
            </div>

            <div className="absolute bottom-6 left-6 z-20">
              <h3 className="text-xl font-bold text-white">
                Timeline
              </h3>

              <p className="text-white/70 mt-1 text-sm">
                Track story chronology
              </p>
            </div>
          </div>

          {/* OUTLINE */}
          <div className="relative h-60 rounded-[2rem] bg-linear-to-b from-[#3b3b3b] to-[#161616] shadow-[0_20px_30px_rgba(0,0,0,0.2)] overflow-hidden">

            <div className="absolute top-8 left-20 w-36 h-32 bg-[#f4f4f4] rounded-[1.5rem] rotate-2 shadow-md">
              <div className="p-4 space-y-3">
                <div className="h-2 bg-black/10 rounded-full w-24"></div>
                <div className="h-2 bg-black/10 rounded-full w-20"></div>
                <div className="h-2 bg-black/10 rounded-full w-16"></div>
              </div>
            </div>

            <div className="absolute top-12 left-8 w-44 h-36 bg-[#696969] rounded-3xl rotate-[-8deg] shadow-xl">
              <div className="p-4">
                <div className="space-y-3">
                  <div className="h-2 bg-black/10 rounded-full w-28"></div>
                  <div className="h-2 bg-black/10 rounded-full w-24"></div>
                  <div className="h-2 bg-black/10 rounded-full w-20"></div>
                  <div className="h-2 bg-black/10 rounded-full w-16"></div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-black/20 backdrop-blur-xl border border-white/10 rounded-t-[2rem]">
              <div className="absolute inset-0 bg-linear-to-r from-white/10 via-transparent to-transparent opacity-20"></div>
            </div>

            <div className="absolute bottom-6 left-6 z-20">
              <h3 className="text-xl font-bold text-white">
                Outline
              </h3>

              <p className="text-white/70 mt-1 text-sm">
                Structure your narrative
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}