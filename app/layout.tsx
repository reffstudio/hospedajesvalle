import type React from "react"
import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SiteJsonLd } from "@/components/site-json-ld"
import { getSiteUrl, ogDescription, ogImage, siteDescription, siteName } from "@/lib/site"
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

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Renta y administración de propiedades`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName,
    title: `${siteName} | Renta y administración de propiedades`,
    description: ogDescription,
    type: "website",
    url: siteUrl,
    images: [ogImage],
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: ogDescription,
    images: [{ url: ogImage.url, alt: ogImage.alt }],
    site: "@hospedajesvalle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${cormorant.variable} antialiased`}>
      <head>
        <link rel="preload" as="image" href="/fondo-valle-1.png" fetchPriority="high" />
      </head>
      <body className="font-sans bg-valle-sage-50 text-valle-forest-900 overflow-x-hidden">
        <SiteJsonLd />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
