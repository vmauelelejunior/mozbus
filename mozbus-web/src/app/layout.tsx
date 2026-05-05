import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
const ChatSupport = dynamic(() => import("@/components/ChatSupport"));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MozBus Connect | Ecossistema de Transporte Premium",
  description: "A plataforma líder em gestão de transportes e bilheteira digital em Moçambique.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MozBus",
  },
  formatDetection: {
    telephone: false,
  },
};

import ConnectivityListener from "@/components/ConnectivityListener";
import { ToastProvider } from "@/components/EliteToast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-MZ"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
          <ConnectivityListener />
          <ChatSupport />
        </ToastProvider>
      </body>
    </html>
  );
}
