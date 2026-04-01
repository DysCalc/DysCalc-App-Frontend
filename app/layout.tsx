import type { Metadata } from "next";
import { Beiruti } from "next/font/google";

import "../app/globals.css";

const beiruti = Beiruti({
  subsets: ["latin"],
  variable: "--font-beiruti",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DysCalc",
  description: "Dyscalculia screening thesis app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${beiruti.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}