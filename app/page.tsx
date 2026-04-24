"use client";
import { useAuth } from "@/contexts/auth-provider";

export default function Home() {
  const { loginWithGoogle } = useAuth();


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 bg-white dark:bg-black sm:items-center">
        This is the landing page.

        <button className="bg-white text-black font-semibold border border-black px-4 py-2 rounded-lg cursor-pointer hover:bg-black hover:text-white" onClick={loginWithGoogle}>
          Login with Google
        </button>
      </main>
    </div>
  );
}
