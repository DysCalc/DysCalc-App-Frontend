"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/auth-provider";

export default function Home() {
  const { logout, user } = useAuth();

  const name = user?.user_metadata?.full_name;
  const email = user?.email;
  const avatar = user?.user_metadata?.avatar_url;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 bg-white dark:bg-black sm:items-center">
        
        {/* Profile Image */}
        {avatar && (
          <Image
            src={avatar}
            alt="Profile picture"
            width={96}
            height={96}
            className="rounded-full"
          />
        )}

        {/* User Info */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            {name || "No Name"}
          </h1>
          <p className="text-gray-500">{email}</p>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-white hover:opacity-80"
        >
          Logout
        </button>

      </main>
    </div>
  );
}
