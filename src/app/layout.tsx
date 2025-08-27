import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TheVibeRadio",
  description: "Balkan hits 24/7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={`${geistSans.variable} ${geistMono.variable}  min-h-screen flex flex-col antialiased overflow-x-clip`}>

        {/* FULL-WIDTH HEADER */}
        <Header />

        {/* Централно съдържание, ограничено до 1540px */}
        <div className="w-full max-w-[1640px] mx-auto flex-1 px-4 flex flex-col">
          <main className="flex-1">{children}</main>
          {/* <Player variant="bar" /> */}  
          <Footer />
        </div>
      </body>
    </html>
  );
}
