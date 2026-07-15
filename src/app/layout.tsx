import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Santhoshini's Wedding Planner",
  description: "One dashboard for everything — plan, track, and celebrate every moment of Santhoshini's wedding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full antialiased"><SidebarProvider>{children}</SidebarProvider></body>
    </html>
  );
}
