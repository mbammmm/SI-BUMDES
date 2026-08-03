import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SI-BUMDes Maju Langgeng",
  description: "Sistem Informasi Terpadu BUMDes",
  manifest: "/manifest.json",
  themeColor: "#0D7C66",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SI-BUMDes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
