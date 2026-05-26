"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-provider";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7] font-sans overflow-hidden relative">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#ECF9F4] blur-[120px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-blue-50 blur-[120px] pointer-events-none opacity-60"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex w-full items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Image src="/icons/dyscalc-icon.svg" alt="DysCalc Logo" width={40} height={40} />
          <span className="text-2xl font-extrabold tracking-tight text-zinc-800">DysCalc</span>
        </div>
        <button
          onClick={loginWithGoogle}
          className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Sign In with Google
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto mt-10 md:mt-0">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-6 inline-flex items-center rounded-full border border-[#29A177]/20 bg-[#ECF9F4] px-4 py-1.5 text-sm font-semibold text-[#29A177]">
            <span className="flex h-2 w-2 rounded-full bg-[#29A177] mr-2"></span>
            Empowering Every Learner
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#2B2B2B] mb-8 leading-tight">
            Discover a Smarter Way to <br className="hidden md:block" />
            Screen <span className="text-[#29A177]">Dyscalculia.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            DysCalc is a comprehensive platform designed for educators to identify, assess, and support students with math learning difficulties through data-driven insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={loginWithGoogle}
              className="group flex items-center justify-center gap-2 rounded-full bg-[#29A177] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#29A177]/20 transition-all hover:bg-[#20825f] hover:scale-105"
            >
              Get Started with Google
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-full bg-white border border-zinc-200 px-8 py-4 text-lg font-bold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Mockup / Abstract illustration space */}
        <div className="mt-20 mb-12 w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white/50 p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <div className="h-[300px] md:h-[400px] w-full rounded-xl border border-zinc-100 bg-zinc-50/50 flex flex-col items-center justify-center relative overflow-hidden">
            {/* A beautiful gradient backdrop for the main icon */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ECF9F4]/80 to-blue-50/80"></div>
            <Image src="/icons/main-icon.svg" alt="DysCalc Graphic" width={250} height={250} className="relative z-10 opacity-90 drop-shadow-2xl transition-transform duration-700 hover:scale-105" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 flex flex-col items-center justify-center gap-2 text-sm text-zinc-400">
        <div>&copy; {new Date().getFullYear()} DysCalc. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-600 transition-colors">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-zinc-600 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
