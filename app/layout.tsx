import type { Metadata } from "next";
import { Beiruti, Inter, Manrope } from "next/font/google";
import "./globals.css";

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
        `}
      >
        {children}
      </body>
    </html>
  );
}