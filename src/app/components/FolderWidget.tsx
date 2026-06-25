import Image from "next/image";
import Link from "next/link";

type FolderWidgetProps = {
  title: string;
  description: string;
  href: string;
};

export default function FolderWidget({
  title,
  description,
  href,
}: FolderWidgetProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl border border-white/[0.07] bg-[#0b0b0d] p-5 transition hover:-translate-y-0.5 hover:border-orange-500/35 hover:bg-[#101012] focus:outline-none focus:ring-2 focus:ring-orange-500/40"
    >
      <div className="relative mx-auto aspect-[1.45] w-full max-w-64">
        <Image
          src="/folder-widget.jpg"
          alt=""
          fill
          sizes="(min-width: 768px) 280px, 80vw"
          className="object-contain opacity-90 grayscale transition group-hover:opacity-100"
          priority
        />
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
        </div>
        <span className="rounded-md border border-white/[0.08] px-2.5 py-1 text-xs font-semibold text-orange-400">
          Open
        </span>
      </div>
    </Link>
  );
}
