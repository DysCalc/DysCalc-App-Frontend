"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = {
  code: string;
};

export default function CopyClassroomCodeButton({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="
        relative flex h-6 w-6 items-center justify-center rounded-md
        bg-[#29A177] text-white
        transition-all duration-300 ease-out
        hover:bg-[#DFDC2F] hover:text-white
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
          copied ? "scale-100 opacity-100 text-white" : "scale-0 opacity-0"
        }`}
      />
    </button>
  );
}