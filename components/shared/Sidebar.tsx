"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowsRightLeftIcon,
  EllipsisVerticalIcon,
  ArrowUturnLeftIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/auth-provider";
import { formatProfile } from "@/hooks/use-profile";
import {
  getStudentNavigations,
  getEducatorNavigations,
  getAdminNavigations,
} from "@/constants/navigation-links";
import type { NavGroup } from "@/types/navigation";
import LogoutModal from "./LogoutModal";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("");
  const [userNickname, setUserNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user, loading, profile, logout } = useAuth();
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);
  const currentRoute = pathSegments[0] ?? "";
  const routeId = pathSegments[1] ?? "";

  useEffect(() => {
    if (!user) return;
    if (loading) return;

    const { name, avatar_url, role, nickname } = formatProfile(user, profile);

    setUserName(name);
    setAvatarUrl(avatar_url || null);
    setUserRole(role);
    setUserNickname(nickname);
  }, [user, loading, profile]);

  const showIn = ["/admin", "/student", "/educator"];
  const shouldShow = showIn.some((path) => pathname.startsWith(path));

  if (!user || !shouldShow) return null;

  const hiddenPaths = [
    "/setup",
    "/login",
    "/",
    "/auth/verify-implicit",
    "/auth/auth-code-error",
  ];

  if (hiddenPaths.includes(pathname)) return null;

  const getNavigations = () => {
    const isAdminUser = userRole.toLowerCase() === "admin";

    let currentContext = userRole.toLowerCase();

    if (pathname.startsWith("/admin")) {
      currentContext = "admin";
    } else if (pathname.startsWith("/student")) {
      currentContext = "student";
    } else if (pathname.startsWith("/educator")) {
      currentContext = "educator";
    }

    let baseNavigations: NavGroup[] = [];

    switch (currentContext) {
      case "student":
        baseNavigations = getStudentNavigations(
          currentRoute === "student" && routeId ? routeId : user.id
        );
        break;

      case "educator":
        baseNavigations = getEducatorNavigations(
          currentRoute === "educator" && routeId ? routeId : user.id
        );
        break;

      case "admin":
        baseNavigations = getAdminNavigations(
          currentRoute === "admin" && routeId ? routeId : user.id
        );
        break;

      default:
        baseNavigations = [];
    }

    if (isAdminUser && currentContext !== "admin") {
      const backToAdminNav: NavGroup = {
        title: "Admin Controls",
        links: [
          {
            label: "Back to Admin",
            href: `/admin/${user.id}/dashboard`,
            icon: ArrowUturnLeftIcon,
          },
        ],
      };

      return [backToAdminNav, ...baseNavigations];
    }

    return baseNavigations;
  };

  const navigations = getNavigations();

  const profileContext =
    currentRoute === "student" ||
    currentRoute === "educator" ||
    currentRoute === "admin"
      ? currentRoute
      : userRole.toLowerCase();

  const profileId = routeId || user.id;
  const profileHref = `/${profileContext}/${profileId}/profile`;

  return (
    <aside
      className={`flex h-full shrink-0 flex-col bg-white transition-[width] duration-500 ease-in-out ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      {/* Header */}
      <div
        className={`group relative flex h-24 shrink-0 items-center border-b border-[#D9D9D9] bg-[#FAFAFA] transition-all duration-500 ${
          collapsed ? "justify-center px-4" : "justify-between px-8"
        }`}
      >
        <div className="flex min-w-0 items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <Image
              src="/icons/dyscalc-icon.svg"
              alt="DysCalc Icon"
              width={28}
              height={28}
              className="shrink-0"
            />
          </div>

          <h1
            className={`overflow-hidden whitespace-nowrap text-2xl font-extrabold tracking-wide text-[#29A177] transition-all duration-300 ${
              collapsed
                ? "ml-0 w-0 -translate-x-2 opacity-0"
                : "ml-3 w-auto translate-x-0 opacity-100"
            }`}
          >
            DYSCALC
          </h1>
        </div>

        <div className="relative flex items-center">
          {!collapsed && (
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#F3FBF7] hover:text-[#29A177]"
              aria-label="Sidebar options"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className={`
              absolute top-1/2 -translate-y-1/2
              ${collapsed ? "-right-12" : "-right-11"}
              flex h-8 w-8 items-center justify-center rounded-md
              border border-white bg-[#29A177] shadow-sm
              transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
              ${
                collapsed
                  ? "translate-x-0 scale-100 opacity-100"
                  : "translate-x-2 scale-90 opacity-0 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100"
              }
            `}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ArrowsRightLeftIcon className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-180" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav
        className={`flex flex-1 flex-col justify-between overflow-y-auto transition-all duration-500 ${
          collapsed ? "px-3 py-6" : "px-6 py-6"
        }`}
      >
        <div className="flex-1">
          {navigations.map((group, index) => (
            <div key={index} className={index > 0 ? "mt-8" : ""}>
              <p
                className={`mb-3 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-gray-400 transition-all duration-300 ${
                  collapsed ? "text-center text-[10px]" : "text-left"
                }`}
              >
                {group.title}
              </p>

              <div className="space-y-2">
                {group.links.map((link, linkIndex) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

                  return (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      title={link.label}
                      className={`flex h-12 items-center rounded-lg transition-all duration-300 ${
                        collapsed ? "justify-center px-0" : "px-2"
                      } ${
                        isActive
                          ? "bg-[#F3FBF7] font-semibold text-[#29A177]"
                          : "text-gray-700 hover:bg-[#F3FBF7] hover:text-[#29A177]"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                        <Icon className="h-5 w-5 shrink-0" />
                      </span>

                      <span
                        className={`overflow-hidden whitespace-nowrap text-lg transition-all duration-300 ease-out ${
                          collapsed
                            ? "ml-0 w-0 -translate-x-2 opacity-0"
                            : "ml-2 w-auto translate-x-0 opacity-100"
                        }`}
                      >
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`flex h-12 w-full items-center rounded-lg text-gray-700 transition-all duration-300 hover:bg-red-50 hover:text-red-600 ${
              collapsed ? "justify-center px-0" : "px-2"
            }`}
            title="Logout"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center">
              <ArrowLeftEndOnRectangleIcon className="h-5 w-5 shrink-0" />
            </span>

            <span
              className={`overflow-hidden whitespace-nowrap text-lg transition-all duration-300 ease-out ${
                collapsed
                  ? "ml-0 w-0 -translate-x-2 opacity-0"
                  : "ml-2 w-auto translate-x-0 opacity-100"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </nav>

      {/* Profile */}
      <Link
        href={profileHref}
        className={`shrink-0 bg-[#29A177] text-white transition-all duration-500 hover:bg-[#238B66] ${
          collapsed ? "flex justify-center px-3 py-5" : "flex px-6 py-6"
        }`}
        title="View Profile"
      >
        <div
          className={`flex min-w-0 items-center ${
            collapsed ? "justify-center" : "gap-4"
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white transition-all duration-300 hover:scale-105 hover:ring-4 hover:ring-white/40 hover:ring-offset-2 hover:ring-offset-[#29A177]">
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
                {userName ? userName.charAt(0).toUpperCase() : "?"}
              </div>
            )}
          </div>

          <div
            className={`min-w-0 overflow-hidden transition-all duration-500 ${
              collapsed
                ? "w-0 -translate-x-2 opacity-0"
                : "w-auto translate-x-0 opacity-100"
            }`}
          >
            <p
              className="truncate text-sm font-medium leading-tight text-white/80"
              title={userNickname ? userNickname : `${userRole} Account`}
            >
              {userRole} {userNickname || "Account"}
            </p>

            <h2
              className="truncate text-lg font-semibold leading-tight"
              title={userName}
            >
              {userName}
            </h2>
          </div>
        </div>
      </Link>

      {showLogoutModal && (
        <LogoutModal
          setShowLogoutModal={setShowLogoutModal}
          logout={logout}
        />
      )}
    </aside>
  );
}