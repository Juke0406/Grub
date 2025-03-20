import { PWAInstallPrompt } from "@/components/pwa-prompt";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";
import { metadata } from "./metadata";
import { AppProvider } from "./provider";

const inter = Inter({ subsets: ["latin"] });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PWAInstallPrompt />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
