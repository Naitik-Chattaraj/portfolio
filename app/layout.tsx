import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollSnapper from "@/components/ScrollSnapper";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Naitik Chattaraj | Portfolio",
  description: "Designer · Developer · Storyteller",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rethinkSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {children}
        <Navbar />
        <ScrollSnapper />
      </body>
    </html>
  );
}
