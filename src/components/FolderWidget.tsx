"use client";

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
        <Link href={href}>
          <div className="relative h-60 rounded-4xl bg-linear-to-b from-[#3b3b3b] to-[#161616] shadow-[0_20px_30px_rgba(0,0,0,0.2)] overflow-hidden">

            {/* BACK PAPER */}
            <div className="absolute top-8 left-20 w-36 h-32 bg-[#c7c5c5] rounded-3xl rotate-2 shadow-md">
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
                {title}
              </h3>

              <p className="text-white/60 mt-1 text-sm">
                {description}
              </p>
            </div>
          </div>
        </Link>
  );
}