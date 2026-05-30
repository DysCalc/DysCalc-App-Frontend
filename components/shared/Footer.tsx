"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const path = usePathname();
  if (path.includes("/classrooms")) return null;
  
  return (
    <footer className="h-12 w-full border-t border-gray-200 bg-gray-100 px-6">
      <div className="flex h-full items-center justify-between gap-4">
        {/* Left */}
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} DysCalc. Thesis Project by the Department
          of Computer Science students of MSU-Iligan Institute of Technology
        </p>

        {/* Right */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <a href="/privacy" className="transition-colors hover:text-primary">
            Privacy
          </a>
          <a href="/terms" className="transition-colors hover:text-primary">
            Terms
          </a>
          <a href="/contacts" className="transition-colors hover:text-primary">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}