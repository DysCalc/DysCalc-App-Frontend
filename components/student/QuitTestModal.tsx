"use client";

import { AlertTriangle, X } from "lucide-react";

type QuitTestModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function QuitTestModal({
  onCancel,
  onConfirm,
}: QuitTestModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-white px-8 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-300">
        {/* Close */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#AAAAAA] transition-colors hover:bg-[#F2F2F2] hover:text-[#555]"
          aria-label="Close quit modal"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center text-[#EF4444]">
          <AlertTriangle size={42} strokeWidth={2.3} />
        </div>

        {/* Text */}
        <h2 className="mt-5 text-3xl font-extrabold leading-none text-[#5F5F5F]">
          Quit the test?
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-lg font-medium leading-5 text-[#9A9A9A]">
          Your answers have not been submitted yet. Leaving now will
          <br />
          discard your current progress.
        </p>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 min-w-[130px] items-center justify-center rounded-xl border border-[#E4E4E4] bg-white px-5 text-base font-bold text-[#777] transition-colors hover:bg-[#F7F7F7]"
          >
            Continue Test
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 min-w-[130px] items-center justify-center rounded-xl bg-[#EF4444] px-5 text-base font-bold text-white transition-colors hover:bg-[#DC2626]"
          >
            Quit Anyway
          </button>
        </div>
      </div>
    </div>
  );
}