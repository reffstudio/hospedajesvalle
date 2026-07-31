/*
  ==============================================================
  R E F F   S T U D I O
  Worldwide Creativity
  ==============================================================
  Intentional Design  •  Functional Logic

  "Design. Code. Systems. One Studio. Globally."

  Web: https://reff.studio
  Contact: hello@reff.studio
  ==============================================================
*/
import type React from "react"
import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { ReffStudioHtmlComment } from "@/components/reff-studio-html-comment"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["italic"],
  display: "swap",
  variable: "--font-cormorant",
})

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

const shareImage = {
  url: "/og-share.png",
  alt: "Hospedajes en Valle de Guadalupe — logo sobre viñedos del valle",
  width: 1024,
  height: 1024,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Hospedajes en Valle de Guadalupe — Renta y administración de propiedades",
  description:
    "Hospedajes boutique en Valle de Guadalupe, Baja California. Rentamos y administramos villas, cabañas y glamping entre viñedos.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: "Hospedajes en Valle de Guadalupe",
    title: "Hospedajes en Valle de Guadalupe | Renta y administración de propiedades",
    description:
      "Villas, cabañas y glamping boutique entre los viñedos de Valle de Guadalupe, Baja California.",
    type: "website",
    images: [shareImage],
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hospedajes en Valle de Guadalupe",
    description:
      "Villas, cabañas y glamping boutique entre los viñedos de Valle de Guadalupe, Baja California.",
    images: [shareImage],
    site: "@hospedajesvalle",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${cormorant.variable} antialiased`}>
      <head>
        <link rel="preload" as="image" href="/fondo-valle-1.png" fetchPriority="high" />
      </head>
      <body className="font-sans bg-valle-sage-50 text-valle-forest-900 overflow-x-hidden">
        <ReffStudioHtmlComment />
        {children}
      </body>
    </html>
  )
}
