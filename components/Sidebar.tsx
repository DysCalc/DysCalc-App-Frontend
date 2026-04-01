"use client";

import { useState } from "react";
import Link from "next/link";
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
          className={`group flex h-24 items-center border-b border-[#D9D9D9] bg-[#FAFAFA] ${
            collapsed ? "justify-center px-4" : "justify-between px-8"
          }`}
        >
          {!collapsed && (
            <h1 className="text-2xl font-extrabold tracking-wide text-[#29A177]">
              DYSCALC
            </h1>
          )}

          {collapsed && (
            <h1 className="text-2xl font-extrabold tracking-wide text-[#29A177]">
              D
            </h1>
          )}

          <div className="relative flex items-center">
            {!collapsed && (
              <button className="text-gray-500 transition-colors hover:text-[#29A177]">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`absolute ${
                collapsed ? "-right-14 opacity-100" : "-right-11 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 duration-500"
              } rounded-md border border-gray-300 bg-white p-1 shadow-sm transition-all duration-500`}
            >
              <ArrowsRightLeftIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className={`${collapsed ? "px-3 py-6" : "px-8 py-6"}`}>
          <p
            className={`mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
              collapsed ? "text-center text-xs" : ""
            }`}
          >
            Main
          </p>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className={`flex items-center h-12 rounded-xl text-gray-700 transition-colors duration-200 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
                collapsed
                  ? "justify-center"
                  : "gap-3 px-3 text-xl"
              }`}
            >
              <HomeIcon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Dashboard</span>}
            </Link>

            <Link
              href="/posts"
              className={`flex items-center rounded-xl text-gray-700 transition-colors duration-200 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
                collapsed
                  ? "justify-center px-3 py-3"
                  : "gap-3 px-3 py-3 text-xl"
              }`}
            >
              <NewspaperIcon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Posts</span>}
            </Link>
          </div>

          <p className={`mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 ${
              collapsed ? "text-center text-xs" : ""
            }`}
          >
            Settings
          </p>

          <Link
            href="/settings"
            className={`mt-2 flex rounded-xl text-gray-700 transition-colors duration-200 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
              collapsed
                ? "justify-center px-3 py-3"
                : "items-center justify-between px-3 py-3 text-xl"
            }`}
          >
            {collapsed ? (
              <Cog8ToothIcon className="h-5 w-5" />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Cog8ToothIcon className="h-5 w-5" />
                  <span>Settings</span>
                </div>

                <div className="group/icon p-1">
                  <ChevronRightIcon className="h-5 w-5 text-gray-500 transition-transform duration-300 group-hover/icon:rotate-90" />
                </div>
              </>
            )}
          </Link>
        </nav>
      </div>

      {/* User Footer */}
      <div
        className={`h-[200px] bg-[#29A177] text-white transition-all duration-300 ${
          collapsed ? "px-3 py-5" : "px-6 py-6"
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-4"
          }`}
        >
          {/* Avatar */}
          <div className="h-11 w-11 shrink-0 rounded-full bg-white" />

          {/* Text (animated instead of removed) */}
          <div
            className={`min-w-0 overflow-hidden transition-all duration-300 ${
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