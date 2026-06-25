import AppSidebar from "./AppSidebar";

type AppFrameProps = {
  children: React.ReactNode;
};

export default function AppFrame({ children }: AppFrameProps) {
  return (
    <main className="min-h-screen bg-[#030303] text-zinc-100">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10">
          {children}
        </section>
      </div>
    </main>
  );
}
