"use client";

import { LogOut, X } from "lucide-react";

export default function LogoutModal({
  setShowLogoutModal,
  logout,
}: {
  setShowLogoutModal: (value: boolean) => void;
  logout: () => Promise<void>;
}) {
  const handleCancel = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-white px-8 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-300">
        {/* Close */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#AAAAAA] transition-colors hover:bg-[#F2F2F2] hover:text-[#555]"
          aria-label="Close logout modal"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center text-[#EF4444]">
          <LogOut size={42} strokeWidth={2.3} />
        </div>

        {/* Text */}
        <h2 className="mt-5 text-3xl font-extrabold leading-none text-[#5F5F5F]">
          Log out?
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-lg font-medium leading-5 text-[#9A9A9A]">
          Are you sure you want to log out?
          <br />
          You will need to sign in again to continue.
        </p>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-11 min-w-[130px] items-center justify-center rounded-xl border border-[#E4E4E4] bg-white px-5 text-base font-bold text-[#777] transition-colors hover:bg-[#F7F7F7]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 min-w-[130px] items-center justify-center rounded-xl bg-[#EF4444] px-5 text-base font-bold text-white transition-colors hover:bg-[#DC2626]"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}