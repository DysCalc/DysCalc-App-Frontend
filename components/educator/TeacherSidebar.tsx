"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import {
  ArrowsRightLeftIcon,
  ChevronRightIcon,
  Cog8ToothIcon,
  EllipsisVerticalIcon,
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function TeacherSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  function toProperCase(name: string) {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) =>
        word
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-")
      )
      .join(" ");
  }

  useEffect(() => {
    const getUserName = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        setUserName("User");
        return;
      }

      const rawName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email ||
        "User";

      setUserName(toProperCase(rawName));
      setAvatarUrl(user?.user_metadata?.avatar_url || null);
    };

    getUserName();
  }, [supabase]);

  return (
    <aside
      className={`flex h-screen flex-col bg-white transition-[width] duration-500 ease-in-out ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      {/* Header = 20% */}
      <div
        className={`group flex flex-[2] items-center border-b border-[#D9D9D9] bg-[#FAFAFA] ${
          collapsed ? "justify-center px-4" : "justify-between px-8"
        }`}
      >
        <div className="flex items-center">
          <Image
            src="/icons/dyscalc-icon.svg"
            alt="DysCalc Icon"
            width={28}
            height={28}
            className="shrink-0"
          />

          <h1
            className={`text-2xl font-extrabold tracking-wide text-[#29A177] transition-all duration-300 ${
              collapsed
                ? "ml-0 w-0 overflow-hidden opacity-0"
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
            className={`
              absolute top-1/2 -translate-y-1/2
              ${collapsed ? "-right-12" : "-right-11"}
              rounded-md border border-white bg-[#29A177] p-1 shadow-sm
              transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
              ${
                collapsed
                  ? "opacity-100 scale-100 translate-x-0"
                  : "opacity-0 scale-90 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0"
              }
            `}
          >
            <ArrowsRightLeftIcon className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-180" />
          </button>
        </div>
      </div>

      {/* Nav = 60% */}
      <nav className={`${collapsed ? "px-3 py-6" : "px-6 py-6"} flex-[65%] overflow-y-auto`}>
        <p
          className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 transition-all duration-300 ${
            collapsed ? "text-center text-[10px]" : ""
          }`}
        >
          Main
        </p>

        <div className="space-y-2">
          <Link
            href="/educator/dashboard"
            className={`flex h-12 items-center rounded-lg text-gray-700 transition-all duration-300 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
              collapsed ? "justify-center" : "px-3"
            }`}
            title="Dashboard"
          >
            <HomeIcon className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${
                collapsed
                  ? "ml-0 w-0 -translate-x-2 opacity-0"
                  : "ml-3 w-auto translate-x-0 opacity-100"
              }`}
            >
              Dashboard
            </span>
          </Link>

          <Link
            href="/educator/students"
            className={`flex h-12 items-center rounded-lg text-gray-700 transition-all duration-300 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
              collapsed ? "justify-center" : "px-3"
            }`}
            title="Students"
          >
            <UserGroupIcon className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${
                collapsed
                  ? "ml-0 w-0 -translate-x-2 opacity-0"
                  : "ml-3 w-auto translate-x-0 opacity-100"
              }`}
            >
              Students
            </span>
          </Link>

          <Link
            href="/educator/assessments"
            className={`flex h-12 items-center rounded-lg text-gray-700 transition-all duration-300 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
              collapsed ? "justify-center" : "px-3"
            }`}
            title="Assessments"
          >
            <ClipboardDocumentListIcon className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${
                collapsed
                  ? "ml-0 w-0 -translate-x-2 opacity-0"
                  : "ml-3 w-auto translate-x-0 opacity-100"
              }`}
            >
              Assessments
            </span>
          </Link>

          <Link
            href="/educator/reports"
            className={`flex h-12 items-center rounded-lg text-gray-700 transition-all duration-300 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
              collapsed ? "justify-center" : "px-3"
            }`}
            title="Reports"
          >
            <ChartBarIcon className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${
                collapsed
                  ? "ml-0 w-0 -translate-x-2 opacity-0"
                  : "ml-3 w-auto translate-x-0 opacity-100"
              }`}
            >
              Reports
            </span>
          </Link>
        </div>

        <p
          className={`mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-gray-400 transition-all duration-300 ${
            collapsed ? "text-center text-[10px]" : ""
          }`}
        >
          Settings
        </p>

        <Link
          href="/educator/profile"
          className={`group flex h-12 items-center rounded-lg text-gray-700 transition-all duration-300 hover:bg-[#F3FBF7] hover:text-[#29A177] ${
            collapsed ? "justify-center" : "justify-between px-3"
          }`}
          title="Profile Settings"
        >
          <div className="flex min-w-0 items-center">
            <Cog8ToothIcon className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${
                collapsed
                  ? "ml-0 max-w-0 -translate-x-2 opacity-0"
                  : "ml-3 max-w-[140px] translate-x-0 opacity-100"
              }`}
            >
              Profile
            </span>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              collapsed
                ? "ml-0 max-w-0 translate-x-2 opacity-0"
                : "ml-2 max-w-[24px] translate-x-0 opacity-100"
            }`}
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-500 transition-transform duration-300 group-hover:rotate-90" />
          </div>
        </Link>
      </nav>

      <div
        className={`flex flex-[15%] bg-[#29A177] text-white transition-all duration-500 ${
          collapsed ? "justify-center px-3 py-5" : "px-6 py-6"
        }`}
      >
        <div className={`flex mt-4 ${collapsed ? "justify-start" : "gap-4"}`}>
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white transition-all duration-300 hover:scale-105 hover:ring-4 hover:ring-white/40 hover:ring-offset-2 hover:ring-offset-[#29A177]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="User Avatar"
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#29A177]">
                {userName.charAt(0)}
              </div>
            )}
          </div>

          <div
            className={`min-w-0 overflow-hidden transition-all duration-500 ${
              collapsed ? "w-0 -translate-x-2 opacity-0" : "w-auto translate-x-0 opacity-100"
            }`}
          >
            <p className="text-base leading-tight opacity-90">Educator Account</p>
            <h2 className="truncate text-xl font-semibold leading-tight">
              {userName}
            </h2>
          </div>
        </div>
      </div>
    </aside>
  );
}