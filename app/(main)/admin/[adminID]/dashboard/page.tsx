"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AdminDashboard({
  params,
}: {
  params: Promise<{ adminID: string }>;
}) {
  const { adminID } = use(params);

  return (
    <div className="flex h-full w-full flex-col">
      {/* HERO = 90% */}
      <div className="flex flex-[90%] w-full bg-[radial-gradient(ellipse_200.56%_459.76%_at_23.54%_96.38%,_#78DAB8_0%,_#29A177_34%,_#076242_100%)]">
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
            <h1 className="text-4xl font-bold text-white">Welcome</h1>

            <div className="text-6xl font-bold text-white">
              Hi Dyscalc Administrator!
            </div>

            <div className="text-2xl leading-10 text-white">
              Let&apos;s start the work!
            </div>

            <Link
              href={`/admin/${adminID}/educators`}
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