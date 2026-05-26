import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2B2B2B] mb-8">Privacy Policy</h1>
          
          <div className="rounded-2xl border border-zinc-200 bg-white/60 p-8 shadow-xl backdrop-blur-md">
            <div className="prose prose-zinc max-w-none text-zinc-600 space-y-6">
              <p className="text-sm font-medium text-[#29A177]">Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">1. Introduction</h2>
              <p>Welcome to DysCalc. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data and tell you about your privacy rights and how the law protects you.</p>

              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">2. Data We Collect</h2>
              <p>We may collect, use, store and transfer different kinds of personal data about you, including Identity Data, Contact Data, and Technical Data, particularly when you use Google Sign-In to access our platform.</p>

              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">3. How We Use Your Data</h2>
              <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide and improve our services, manage your account, and ensure the security of our platform.</p>

              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">4. Data Security</h2>
              <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.</p>

              <h2 className="text-2xl font-bold text-zinc-800 mt-8 border-b border-zinc-100 pb-2">5. Contact Us</h2>
              <p>If you have any questions about this privacy policy or our privacy practices, please contact us.</p>
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
