import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import PWAManager from "@/components/pwa-manager"
import OfflineIndicator from "@/components/offline-indicator"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Prontuário Pluma - Gestão de Prontuários Clínicos",
  description: "Plataforma para psicólogas organizarem e gerenciarem prontuários clínicos com IA",
  generator: "v0.dev",
  manifest: "/manifest.json",
  keywords: ["psicologia", "prontuários", "clínica", "gestão", "pwa"],
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#a855f7" },
    { media: "(prefers-color-scheme: dark)", color: "#a855f7" },
  ],
  authors: [{ name: "Prontuário Pluma" }],
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prontuário Pluma",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Prontuário Pluma",
    title: "Prontuário Pluma - Gestão de Prontuários Clínicos",
    description: "Plataforma para psicólogas organizarem e gerenciarem prontuários clínicos com IA",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Prontuário Pluma" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#a855f7" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <OfflineIndicator />
        {children}
        <PWAManager />
      </body>
    </html>
  )
}
