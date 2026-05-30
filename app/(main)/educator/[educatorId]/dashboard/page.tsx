"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";

export default function EducatorDashboard({
  params,
}: {
  params: Promise<{ educatorId: string }>;
}) {
  const { educatorId } = use(params);

  return (
    <div className="flex h-full w-full flex-col">
      {/* HERO = 80% (matches sidebar 2 + 6) */}
      <div className="flex flex-[90%] w-full bg-[radial-gradient(ellipse_200.56%_459.76%_at_23.54%_96.38%,_#CCE6FF_0%,_#E6F8FF_42%,_#D1D6FF_100%)]">
        {/* LEFT */}
        <div className="flex w-1/2 items-center justify-end">
          <div className="-mr-20 flex flex-1 items-center justify-end">
            <Image
              src="/icons/main-icon.svg"
              alt="DysCalc Logo"
              width={650}
              height={650}
              className="dyscalc-swell-pulse-shrink-bounce-disappear object-contain"
              priority
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="-ml-10 flex w-1/2 items-center justify-center">
          <div className="flex flex-col items-center space-y-1 pr-40 text-center">
            <h1 className="text-4xl font-bold text-zinc-600">Welcome</h1>

            <div className="text-6xl font-bold text-zinc-600">
              Hi there, I&apos;m Matha!
            </div>

            <div className="text-2xl leading-10 text-zinc-600">
              Hi Teacher, let&apos;s start the work!
            </div>

            <Link
              href={`/educator/${educatorId}/classroom`}
              className="mt-10 flex h-12 w-48 items-center justify-center rounded-full bg-white text-xl font-semibold text-[#6C6C6C] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#29A177] hover:text-white hover:shadow-lg"
            >
              Let&apos;s get started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}