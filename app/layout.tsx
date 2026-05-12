import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/navigation/Sidebar";
import { CommandPalette } from "@/components/navigation/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScaleTools | Operator Console",
  description: "Amazon Wholesale Supplier Intelligence System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-slate-950">
        <div className="flex min-h-screen">
          <Sidebar />
          <CommandPalette />
          <main className="flex-1 lg:pl-72 pt-16 lg:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
