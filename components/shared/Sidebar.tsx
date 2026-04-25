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
  type NavGroup,
} from "@/types/navigation";
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

  useEffect(() => {
    if (!user) return;
    if (loading) return;

    const { name, avatar_url, role, nickname } = formatProfile(user, profile);

    setUserName(name);
    setAvatarUrl(avatar_url || null);
    setUserRole(role);
    setUserNickname(nickname);
  }, [user, loading, profile]);

  if (!user) return null;

  // Don't show sidebar on auth pages, setup, or landing page
  const hiddenPaths = ["/setup", "/login", "/", "/auth/verify-implicit", "/auth/auth-code-error"];
  if (hiddenPaths.includes(pathname)) return null;

  const getNavigations = () => {
    const isAdminUser = userRole.toLowerCase() === "admin";

    // Determine the context based on URL, fallback to user's actual role
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
        baseNavigations = getStudentNavigations(user.id);
        break;
      case "educator":
        baseNavigations = getEducatorNavigations(user.id);
        break;
      case "admin":
        baseNavigations = getAdminNavigations(user.id);
        break;
      default:
        baseNavigations = [];
    }

    // Add "Back to Admin" if they are an admin but not in an admin route
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

  return (
    <aside
      className={`flex h-full flex-col bg-white transition-[width] duration-500 ease-in-out ${collapsed ? "w-24" : "w-72"
        }`}
    >
      {/* Header */}
      <div
        className={`group flex h-24 shrink-0 items-center border-b border-[#D9D9D9] bg-[#FAFAFA] ${collapsed ? "justify-center px-4" : "justify-between px-8"
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
            className={`text-2xl font-extrabold tracking-wide text-[#29A177] transition-all duration-300 ${collapsed
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
              ${collapsed
                ? "opacity-100 scale-100 translate-x-0"
                : "opacity-0 scale-90 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0"
              }
            `}
          >
            <ArrowsRightLeftIcon className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-180" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav
        className={`${collapsed ? "px-3 py-6" : "px-6 py-6"
          } flex-1 overflow-y-auto flex flex-col justify-between`}
      >
        <div className="flex-1">
          {navigations.map((group, index) => (
            <div key={index} className={index > 0 ? "mt-8" : ""}>
              <p
                className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 transition-all duration-300 ${collapsed ? "text-center text-[10px]" : ""
                  }`}
              >
                {group.title}
              </p>

              <div className="space-y-2">
                {group.links.map((link, linkIndex) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      className={`flex h-12 items-center rounded-lg transition-all duration-300 ${collapsed ? "justify-center" : "px-3"
                        } ${isActive
                          ? "bg-[#F3FBF7] text-[#29A177] font-semibold"
                          : "text-gray-700 hover:bg-[#F3FBF7] hover:text-[#29A177]"
                        }`}
                      title={link.label}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span
                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${collapsed
                          ? "ml-0 w-0 -translate-x-2 opacity-0"
                          : "ml-3 w-auto translate-x-0 opacity-100"
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

        <div className="mt-8">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`flex w-full h-12 items-center rounded-lg text-gray-700 transition-all duration-300 hover:bg-red-50 hover:text-red-600 ${collapsed ? "justify-center" : "px-3"
              }`}
            title="Logout"
          >
            <ArrowLeftEndOnRectangleIcon className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${collapsed
                ? "ml-0 w-0 -translate-x-2 opacity-0"
                : "ml-3 w-auto translate-x-0 opacity-100"
                }`}
            >
              Logout
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`shrink-0 flex bg-[#29A177] text-white transition-all duration-500 ${collapsed ? "justify-center px-3 py-5" : "px-6 py-6"
          }`}
      >
        <div className={`flex mt-2 ${collapsed ? "justify-start" : "gap-4"}`}>
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
                {userName.charAt(0) || "?"}
              </div>
            )}
          </div>

          <div
            className={`min-w-0 overflow-hidden transition-all duration-500 ${collapsed
              ? "w-0 -translate-x-2 opacity-0"
              : "w-auto translate-x-0 opacity-100"
              }`}
          >
            <p className="text-base leading-tight opacity-90" title={userNickname ? userNickname : userRole + " Account"}>
              {userRole} {userNickname || "Account"}
            </p>
            <h2 className="truncate text-xl font-semibold leading-tight" title={userName}>
              {userName}
            </h2>
          </div>
        </div>
      </div>

      {showLogoutModal && <LogoutModal setShowLogoutModal={setShowLogoutModal} logout={logout} />}
    </aside>
  );
}