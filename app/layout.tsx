import type { Metadata } from "next";
import { Beiruti, Inter, Manrope } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/contexts/auth-provider";
import Footer from "@/components/shared/Footer";
import Sidebar from "@/components/shared/Sidebar";
import Toaster from "@/components/shared/Toaster";

const beiruti = Beiruti({
  subsets: ["latin"],
  variable: "--font-beiruti",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "DysCalc",
  description: "Dyscalculia screening thesis app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${beiruti.variable}
          ${inter.variable}
          ${manrope.variable}
          font-sans
          bg-[#f5f5f0]
        `}
      >
        <AuthProvider>
          <div className="flex h-screen overflow-hidden bg-[#f5f5f0]">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-y-auto">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}