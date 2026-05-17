"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, EllipsisVertical, LogOut } from "lucide-react";

type Props = {
  studentId: string;
  id: string;
  title: string;
  duration: string;
  code: string;
  textColor?: string;
  accentColor?: string;
};

export default function LearningPathCard({
  studentId,
  id,
  title,
  duration,
  code,
  textColor = "text-[#9A9A9A]",
  accentColor = "#EF4444",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleRequestLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setMenuOpen(false);
    console.log("Request leave:", id);
  };

  return (
    <Link
      href={`/student/${studentId}/classrooms/${id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMenuOpen(false);
      }}
      style={{
        backgroundColor: hovered ? accentColor : "#F8F8F8",
      }}
      className="group relative min-h-[160px] overflow-hidden rounded-xl px-9 py-8 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Ribbon */}
      <div className="absolute right-5 -top-[2px] h-[120px] w-28 overflow-hidden">
        <div
          className="
            absolute right-5 -top-[2px]
            h-[120px] w-10
            transition-all duration-700
            ease-[cubic-bezier(0.16,1,0.3,1)]
            group-hover:h-[140px]
          "
          style={{
            backgroundColor: hovered ? "#FFFFFF" : accentColor,
            clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 72%, 0 85%)",
          }}
        />
      </div>

      {/* Content */}
      <h2
        className={`pr-14 text-2xl font-extrabold transition-colors duration-500 md:text-2xl ${
          hovered ? "text-white" : "text-[#9A9A9A]"
        }`}
      >
        {title}
      </h2>

      <p
        className={`mt-2 text-base font-medium transition-colors duration-500 md:text-base ${
          hovered ? "text-white/85" : "text-[#9A9A9A]"
        }`}
      >
        Duration:{" "}
        <span className={hovered ? "font-semibold text-white" : textColor}>
          {duration}
        </span>
      </p>

      {/* Bottom row */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {/* Code + Copy */}
        <div className="flex items-center gap-3">
          <p
            className={`text-sm font-medium tracking-wide transition-colors duration-500 ${
              hovered ? "text-white/80" : "text-[#C5C5C5]"
            }`}
          >
            {code}
          </p>

          <button
            type="button"
            onClick={handleCopy}
            className="
              relative flex h-6 w-6 items-center justify-center rounded-md
              bg-white/20 text-white opacity-0 backdrop-blur-sm
              transition-all duration-300 ease-out
              group-hover:opacity-100 hover:bg-white hover:text-[#555]
            "
            aria-label="Copy classroom code"
          >
            <Copy
              size={14}
              className={`absolute transition-all duration-200 ${
                copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
              }`}
            />

            <Check
              size={14}
              className={`absolute transition-all duration-200 ${
                copied
                  ? "scale-100 opacity-100 text-[#2FA46F]"
                  : "scale-0 opacity-0"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center overflow-hidden rounded-md">
          <div
            className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
              menuOpen ? "max-w-[150px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={handleRequestLeave}
              className="
                flex h-6 items-center gap-1.5 whitespace-nowrap rounded-l-md
                bg-white/20 px-2 text-[11px] font-semibold text-white
                backdrop-blur-sm transition-all duration-200
                hover:bg-white hover:text-[#555]
              "
            >
              <LogOut size={14} />
              Request Leave
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="
              relative flex h-6 w-6 items-center justify-center rounded-md
              bg-white/20 text-white opacity-0 backdrop-blur-sm
              transition-all duration-300 ease-out
              group-hover:opacity-100 hover:bg-white hover:text-[#555]
            "
            aria-label="Open classroom actions"
          >
            <EllipsisVertical size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}