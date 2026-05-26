import Link from "next/link";
import Image from "next/image";

export default function TermsOfService() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7] font-sans relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#ECF9F4] blur-[120px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-blue-50 blur-[120px] pointer-events-none opacity-60"></div>

      <nav className="relative z-10 flex w-full items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-zinc-200/50">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <Image src="/icons/dyscalc-icon.svg" alt="DysCalc Logo" width={36} height={36} />
          <span className="text-2xl font-extrabold tracking-tight text-zinc-800">DysCalc</span>
        </Link>
      </nav>

      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-8 py-12">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2B2B2B] mb-8">Terms of Service</h1>
          
          <div className="rounded-2xl border border-zinc-200 bg-white/60 p-8 shadow-xl backdrop-blur-md">
            <div className="prose prose-zinc max-w-none text-zinc-600 space-y-6">
              <p className="text-sm font-medium text-[#29A177]">Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">1. Acceptance of Terms</h2>
              <p>By accessing and using DysCalc, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>

              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on DysCalc's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>

              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">3. Disclaimer</h2>
              <p>The materials on DysCalc's website are provided on an 'as is' basis. DysCalc makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">4. Limitations</h2>
              <p>In no event shall DysCalc or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DysCalc's website.</p>

              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">5. Revisions and Errata</h2>
              <p>The materials appearing on DysCalc's website could include technical, typographical, or photographic errors. DysCalc does not warrant that any of the materials on its website are accurate, complete or current.</p>
              
              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">6. Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full py-8 text-center text-sm text-zinc-400">
        &copy; {new Date().getFullYear()} DysCalc. All rights reserved.
      </footer>
    </div>
  );
}
