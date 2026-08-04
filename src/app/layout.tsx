import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import SyncInitializer from "@/components/sync-initializer";
import OfflineIndicator from "@/components/offline-indicator";

const inter = Inter({ subsets: ["latin"] });

export const runtime = "nodejs";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
} as const;

export const metadata: Metadata = {
  title: "SI-BUMDes Maju Langgeng",
  description: "Sistem Informasi Terpadu BUMDes",
  manifest: "/manifest.json",
  themeColor: "#0D7C66",
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
        <SyncInitializer />
        <OfflineIndicator />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                if (location.hostname === 'localhost') {
                  navigator.serviceWorker.getRegistration().then(function(reg) {
                    if (reg) { reg.unregister(); }
                  });
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                      reg.updateViaCache = 'none';
                    }).catch(function(err) {
                      console.log('ServiceWorker registration failed:', err);
                    });
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
