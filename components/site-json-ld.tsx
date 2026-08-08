import { getSiteUrl, ogImage, siteDescription, siteName } from "@/lib/site"

export function SiteJsonLd() {
  const siteUrl = getSiteUrl()

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo-hospedajes-valle.png`,
    description: siteDescription,
    areaServed: {
      "@type": "Place",
      name: "Valle de Guadalupe, Baja California, México",
    },
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: ["es-MX", "en-US"],
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: `${siteUrl}/logo-hospedajes-valle.png`,
    },
  }

  const lodgingBusiness = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    image: `${siteUrl}${ogImage.url}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Valle de Guadalupe",
      addressRegion: "Baja California",
      addressCountry: "MX",
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusiness) }} />
    </>
  )
}
