"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";

export default function UserDashboard({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);

  return (
    <div className="flex h-full w-full flex-col">
      {/* HERO SECTION */}
      <div className="flex h-full w-full bg-[radial-gradient(ellipse_200.56%_459.76%_at_23.54%_96.38%,_#FFF4C2_0%,_#FFE030_34%,_#EAB300_100%)]">
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
          <div className="flex flex-col items-center space-y-1 pr-10 text-center text-white">
            <h1 className="text-4xl font-bold drop-shadow-lg">
              Let&apos;s get started with DysCalc!
            </h1>

            <div className="text-6xl font-bold drop-shadow-lg">
              Let&apos;s start your journey!
            </div>

            <div className="text-2xl leading-10 text-zinc-600 drop-shadow-sm">
              I am here to help you learn numbers and math.
            </div>

            <Link
              href={`/student/${studentId}/classrooms`}
              className="mt-10 flex h-12 w-48 items-center justify-center rounded-full bg-white text-xl font-semibold text-[#6C6C6C] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#29A177] hover:text-white hover:shadow-lg"
            >
              Start
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}