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

export const metadata: Metadata = {
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
    images: [
      {
        url: "/fondo-valle-1.png",
        alt: "Viñedos y montañas del Valle de Guadalupe",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hospedajes en Valle de Guadalupe",
    description:
      "Villas, cabañas y glamping boutique entre los viñedos de Valle de Guadalupe, Baja California.",
    images: [
      {
        url: "/fondo-valle-1.png",
        alt: "Viñedos y montañas del Valle de Guadalupe",
      },
    ],
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
