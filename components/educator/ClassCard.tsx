"use client";

import { useState } from "react";
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type ClassCardProps = {
  id: number;
  name: string;
  student_count: number;
  variant?: "green" | "blue" | "gray" | "yellow" | "empty";
  className?: string;
  onEdit: () => void;
  onDelete: () => void;
  onCardClick: (classroomId: number) => void;
};

const variantStyles = {
  yellow: {
    bg: "bg-[#E3d860]",
    text: "text-[#827D2A]",
    sub: "text-[#827D2A]/80",
    border: "border border-[#D9D9D9]",
    icon: "text-[#827D2A]/80 hover:text-[#827D2A]",
    hover: "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
    menuBg: "bg-[#F5ED9A]",
    menuText: "text-[#827D2A]",
    menuHover: "hover:bg-[#EBDD6A]",
    ellipsisHover: "hover:bg-[#EBDD6A]",
  },
  green: {
    bg: "bg-[#29A177]",
    text: "text-white",
    sub: "text-white/80",
    border: "border border-[#D9D9D9]",
    icon: "text-white/80 hover:text-white",
    hover: "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
    menuBg: "bg-[#218764]",
    menuText: "text-white",
    menuHover: "hover:bg-[#1b7053]",
    ellipsisHover: "hover:bg-[#1b7053]",
  },
  blue: {
    bg: "bg-[#608CCC]",
    text: "text-white",
    sub: "text-white/80",
    border: "border border-[#D9D9D9]",
    icon: "text-white/80 hover:text-white",
    hover: "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
    menuBg: "bg-[#4E79B8]",
    menuText: "text-white",
    menuHover: "hover:bg-[#42689f]",
    ellipsisHover: "hover:bg-[#42689f]",
  },
  gray: {
    bg: "bg-[#6C6C6C]",
    text: "text-white",
    sub: "text-white/80",
    border: "border border-[#D9D9D9]",
    icon: "text-white/80 hover:text-white",
    hover: "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
    menuBg: "bg-[#5A5A5A]",
    menuText: "text-white",
    menuHover: "hover:bg-[#4b4b4b]",
    ellipsisHover: "hover:bg-[#4b4b4b]",
  },
  empty: {
    bg: "bg-[#F8F8F8]",
    text: "text-[#A0A0A0]",
    sub: "text-[#A0A0A0]",
    border: "border border-dashed border-[#D9D9D9]",
    icon: "text-[#A0A0A0]",
    hover: "",
    menuBg: "bg-white",
    menuText: "text-[#6C6C6C]",
    menuHover: "hover:bg-neutral-100",
    ellipsisHover: "hover:bg-neutral-100",
  },
};

export default function ClassCard({
  id,
  name,
  student_count,
  variant = "green",
  className = "",
  onEdit,
  onDelete,
  onCardClick
}: ClassCardProps) {
  const styles = variantStyles[variant];
  const [menuOpen, setMenuOpen] = useState(false);


  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onCardClick(id)}
        onMouseLeave={() => setMenuOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onCardClick(id);
          }
          if (e.key === "Escape") {
            setMenuOpen(false);
          }
        }}
        className={`
          group relative flex flex-col rounded-xl px-6 py-5 text-left transition-all duration-200
          ${styles.bg} ${styles.border} ${styles.hover}
          ${variant === "empty" ? "items-center justify-center" : "w-full items-start justify-end"}
          cursor-pointer
          ${className}
        `}
      >
        {variant !== "empty" && (
          <div
            className={`
              absolute top-3 right-3 z-20 flex items-stretch overflow-hidden rounded-lg
              ${styles.menuBg}
              transition-all duration-200 ease-out
              ${menuOpen
                ? "max-w-[360px] opacity-100 translate-x-0"
                : "max-w-0 opacity-0 translate-x-4 group-hover:max-w-[36px] group-hover:opacity-100 group-hover:translate-x-0"
              }
          `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ACTIONS */}
            <div
              className={`
              flex items-stretch overflow-hidden transition-all duration-200 ease-out
              ${menuOpen ? "max-w-[324px] opacity-100" : "max-w-0 opacity-0"}
              `}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setMenuOpen(false);
                }}
                className={`flex h-9 items-center px-3 text-xs font-medium border-l-0 ${styles.menuText} ${styles.menuHover}`}
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setMenuOpen(false);
                }}
                className={`flex h-9 items-center px-3 text-xs font-medium border-l border-white/10 ${styles.menuText} ${styles.menuHover}`}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>

            {/* ELLIPSIS */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className={`
              flex h-9 w-9 items-center justify-center
              ${styles.icon}
              ${styles.ellipsisHover}
              border-l border-white/10
              `}
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {variant === "empty" ? (
          <span className="text-sm font-medium text-[#A0A0A0]">
            + Add Class
          </span>
        ) : (
          <>
            <span className={`text-xl font-semibold leading-none ${styles.text}`}>
              {name}
            </span>

            <span className={`mt-1 text-sm leading-none ${styles.sub}`}>
              {student_count} {student_count === 1 ? "student" : "students"}
            </span>
          </>
        )}
      </div>
    </>
  );
}