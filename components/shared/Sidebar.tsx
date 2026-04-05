"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowsRightLeftIcon,
  ChevronRightIcon,
  Cog8ToothIcon,
  EllipsisVerticalIcon,
  HomeIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-screen flex-col justify-between bg-white transition-[width] duration-500 ease-in-out ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      
      <div>
        {/* Logo/Header */}
        <div
          className={`group flex h-24 items-center border-b border-[#D9D9D9] bg-[#FAFAFA] duration-500 ${
            collapsed ? "justify-center px-4" : "justify-between px-8"
          }`}
        >
          <div className="flex items-center">
            {/* Icon (always visible) */}
            <Image
              src="/icons/dyscalc-icon.svg"
              alt="DysCalc Icon"
              width={28}
              height={28}
              className="shrink-0"
            />

            <h1
              className={`font-sans font-extrabold tracking-wide text-[#29A177] text-2xl transition-all duration-300 ${
                collapsed
                  ? "ml-0 opacity-0 w-0 overflow-hidden"
                  : "ml-4 opacity-100"
              }`}
            >
              DYSCALC
            </h1>
          </div>

          <div className="relative flex items-center">
            {!collapsed && (
              <button className="text-gray-500 transition-colors hover:text-[#29A177]">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`absolute ${
                collapsed ? "-right-12 opacity-100" : "-right-11 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
              } rounded-md border border-white bg-[#29A177] p-1 shadow-sm transition-all duration-500`}
            >
              <ArrowsRightLeftIcon className="h-5 w-5 text-gray-500 text-white" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className={`${collapsed ? "px-3 py-6" : "px-6 py-6"}`}>
          <p
            className={`font-display mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 transition-all duration-500 ${
              collapsed ? "text-center text-xs" : ""
            }`}
          >
            Main
          </p>

          <div className="space-y-2">
            <Link
              href="/dashboard"
              className={`flex h-12 text-xl items-center rounded-lg text-gray-700 transition-all duration-500 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
                collapsed ? "justify-center" : "px-3"
              }`}
            >
              <HomeIcon className="h-5 w-5 shrink-0" />

              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-800 ease-in-out ${
                  collapsed
                    ? "ml-0 w-0 opacity-0 translate-x-[-10px]"
                    : "ml-3 w-auto opacity-100 translate-x-0"
                }`}
              >
                Dashboard
              </span>
            </Link>

            <Link
              href="/posts"
              className={`flex h-12 text-xl items-center rounded-lg text-gray-700 transition-all duration-700 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
                collapsed ? "justify-center" : "px-3"
              }`}
            >
              <NewspaperIcon className="h-5 w-5 shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-800 ease-in-out ${
                  collapsed
                    ? "ml-0 w-0 opacity-0 translate-x-[-10px]"
                    : "ml-3 w-auto opacity-100 translate-x-0"
                }`}
              >
                Posts
              </span>
            </Link>
          </div>

          <p
            className={`mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-gray-400 transition-all duration-500 ${
              collapsed ? "text-center text-xs" : ""
            }`}
          >
            Settings
          </p>

          <Link
            href="/settings"
            className={`group flex h-12 items-center rounded-lg text-gray-700 transition-all duration-700 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
              collapsed 
                ? "justify-center px-0" : "justify-between px-3"
            }`}
          >
            <div className="flex items-center min-w-0">
              <Cog8ToothIcon className="h-5 w-5 shrink-0" />

              <span
                className={`overflow-hidden whitespace-nowrap text-xl transition-all duration-800 ease-in-out ${
                  collapsed
                    ? "ml-0 max-w-0 opacity-0 -translate-x-2"
                    : "ml-3 opacity-100 translate-x-0"
                }`}
              >
                Settings
              </span>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                collapsed
                  ? "ml-0 max-w-0 opacity-0 translate-x-2"
                  : "ml-2 max-w-[24px] opacity-100 translate-x-0"
              }`}
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-500 transition-transform duration-500 group-hover:rotate-90" />
            </div>
          </Link>
        </nav>
      </div>

      {/* User Footer */}
      <div
        className={`h-[147px] bg-[#29A177] text-white transition-all duration-500 ${
          collapsed ? "px-3 py-5" : "px-6 py-6"
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-4"
          }`}
        >
          {/* Avatar */}
          <div className="h-11 w-11 shrink-0 rounded-full bg-white transition-all duration-300 hover:ring-4 hover:ring-white/40 hover:ring-offset-2 hover:ring-offset-[#29A177] hover:scale-105" />
          <div
            className={`min-w-0 overflow-hidden transition-all duration-600 ${
              collapsed
                ? "w-0 opacity-0 translate-x-[-10px]"
                : "w-auto opacity-100 translate-x-0"
            }`}
          >
            <p className="text-base leading-tight opacity-90">
              User Account
            </p>
            <h2 className="truncate text-xl font-semibold leading-tight">
              Kristoffer Neo Senyahan
            </h2>
          </div>
        </div>
      </div>
    </aside>
  );
}