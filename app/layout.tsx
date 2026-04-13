import type { Metadata } from "next";
import { Suspense } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseLedger",
  description: "SaaS-grade expense tracker with analytics and automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <Suspense fallback={null}>
        <body className="min-h-full flex flex-col">
          <AppProviders>{children}</AppProviders>
        </body>
      </Suspense>
    </html>
  );
}
