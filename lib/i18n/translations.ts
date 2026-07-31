import type { Locale } from "./types"

const es = {
  nav: {
    properties: "Propiedades",
    experiences: "Descubre el Valle",
    reviews: "Reviews",
    management: "Administración",
    contact: "Contacto",
    home: "Inicio",
    mainAria: "Navegación principal",
    menuLabel: "Secciones",
    menuToggleAria: "Abrir menú de secciones",
  },
  common: {
    close: "Cerrar",
    ready: "Listo",
    send: "Enviar",
    requestInfo: "Solicitar información",
    preReserve: "Pre-reservar",
    preReserveShort: "Reservar",
    brandAria: "Hospedajes en Valle de Guadalupe — Inicio",
    language: "Idioma",
  },
  hero: {
    bgAlt: "Viñedos y montañas del Valle de Guadalupe al amanecer",
    title1: "Inmérsete en el",
    title2: "Valle de Guadalupe",
    subtitle:
      "Propiedades seleccionadas entre viñedos y montañas. Haz scroll para sumergirte en el valle y descubrir tu próximo hospedaje.",
    location: "Valle de Guadalupe, B.C.",
    propertiesCount: "+{count} propiedades boutique",
    certifiedHost: "Anfitrión certificado",
    diveIn: "Sumérgete",
    featuredTitle: "Propiedades",
    featuredTitleEm: "destacadas",
    featuredSubtitle:
      "Hospedajes boutique en el corazón del valle. Desliza para explorar todas nuestras propiedades.",
  },
  discoverValley: {
    title: "Descubre el Valle",
    subtitle: "Más que un hospedaje, una inmersión completa en la capital del vino mexicano.",
    dragHint: "Desliza hacia arriba o abajo",
    progressAria: "Progreso de la galería",
    progressRemaining: "{count} restantes",
    cards: {
      "ruta-del-vino": {
        title: "Ruta del Vino",
        description: "Catas privadas y recorridos por las mejores bodegas boutique.",
      },
      "alta-gastronomia": {
        title: "Alta Gastronomía",
        description: "Restaurantes de campo y cocina de autor de nivel internacional.",
      },
      "atardeceres-y-fuego": {
        title: "Atardeceres & Fuego",
        description: "Noches frías alrededor del fogatero con vinos locales bajo las estrellas.",
      },
      "relax-y-bienestar": {
        title: "Relax & Bienestar",
        description: "Escapadas de desconexión total con tinas de hidromasaje y albercas privadas.",
      },
      "paisajes-de-ensueno": {
        title: "Paisajes de Ensueño",
        description: "Vistas panorámicas icónicas a las montañas y olivares en cada propiedad.",
      },
    },
  },
  reviews: {
    title: "Reviews",
    subtitle: "Lo que dicen quienes ya vivieron la experiencia en el valle del vino.",
    average: "4.9",
    averageLabel: "Promedio de huéspedes",
    total: "120+",
    totalLabel: "Reseñas verificadas",
    items: [
      {
        name: "María González",
        origin: "Ciudad de México",
        property: "Villa de Piedra",
        quote:
          "Despertar con vista a los viñedos fue mágico. La casa impecable, el anfitrión atento y las recomendaciones de restaurantes fueron un plus increíble.",
        date: "Marzo 2026",
        rating: 5,
      },
      {
        name: "James & Sarah Miller",
        origin: "San Diego, CA",
        property: "Domo Glamping",
        quote:
          "A perfect blend of nature and comfort. Stargazing from the dome at night and wine tasting during the day — we didn't want to leave.",
        date: "February 2026",
        rating: 5,
      },
      {
        name: "Roberto & Ana López",
        origin: "Tijuana, B.C.",
        property: "Cabaña de Madera",
        quote:
          "Escapada perfecta para el fin de semana. La alberca privada al atardecer, la tranquilidad del valle y un servicio impecable de principio a fin.",
        date: "Enero 2026",
        rating: 5,
      },
      {
        name: "Emily Chen",
        origin: "Los Angeles, CA",
        property: "Suite entre Viñedos",
        quote:
          "Every detail was thoughtfully curated. From the check-in to the local wine recommendations, it felt like a boutique hotel in the middle of the vineyards.",
        date: "December 2025",
        rating: 5,
      },
    ],
  },
  owners: {
    title: "¿Tienes una propiedad en el",
    titleEm: "Valle de Guadalupe?",
    subtitle: "Nosotros la administramos por ti y la convertimos en un hospedaje boutique rentable.",
    cta: "Quiero administrar mi propiedad",
  },
  propertyModal: {
    label: "Administración de propiedades",
    title: "¿Tienes una propiedad en el Valle de Guadalupe?",
    subtitle: "Cuéntanos sobre tu propiedad y te contactaremos con una propuesta de administración a la medida.",
    name: "Nombre completo",
    phone: "Teléfono",
    email: "Correo electrónico",
    aboutLabel: "Cuéntanos acerca de tu propiedad",
    aboutPlaceholder: "Tipo de propiedad, ubicación, capacidad, amenidades, estado actual...",
    successTitle: "¡Solicitud recibida!",
    successBody: "Gracias, {name}. Nuestro equipo revisará la información de tu propiedad y te contactará muy pronto.",
  },
  preReservation: {
    title: "Pre-reserva tu estancia",
    subtitle: "Completa tus datos y elige tus fechas. El administrador confirmará la disponibilidad contigo.",
    name: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono",
    guest: "persona",
    guests: "personas",
    propertiesTitle: "Propiedades de interés",
    selected: "seleccionada",
    selectedPlural: "seleccionadas",
    multiSelect: "Puedes elegir más de una propiedad.",
    datesTitle: "Fechas de estancia",
    checkIn: "Llegada",
    checkOut: "Salida",
    calendarHint: "Selecciona la fecha de llegada y luego la de salida en el calendario.",
    submit: "Enviar pre-reserva",
    disclaimer:
      "Esto es una solicitud de pre-reserva. El administrador de la propiedad confirmará la disponibilidad antes de finalizar.",
    successTitle: "¡Pre-reserva recibida!",
    successBodySingle:
      "Gracias, {name}. El administrador de la propiedad seleccionada revisará tu solicitud y te contactará muy pronto para confirmar la disponibilidad y finalizar tu reservación.",
    successBodyMulti:
      "Gracias, {name}. El administrador de las propiedades seleccionadas revisará tu solicitud y te contactará muy pronto para confirmar la disponibilidad y finalizar tu reservación.",
  },
  quickLook: {
    capacity: "CAPACIDAD",
    amenities: "AMENIDADES",
    includes: "INCLUYE",
    includesList: [
      "Check-in privado y llegada asistida",
      "Limpieza y blancos de hotel",
      "Recomendaciones de viñedos y restaurantes",
      "Soporte del anfitrión 24/7",
    ],
  },
  carousel: {
    prev: "Propiedad anterior",
    next: "Siguiente propiedad",
    goTo: "Ir a {name}",
    viewDetails: "Ver detalles de {name}",
    fullList: "Lista completa",
  },
  propertiesPage: {
    title: "Todas las propiedades",
    subtitle: "Explora nuestro catálogo completo en Valle de Guadalupe y encuentra tu hospedaje ideal.",
    filtersLabel: "Filtrar por amenidades",
    clearFilters: "Limpiar filtros",
    noResults: "No hay propiedades con estas amenidades. Prueba con otros filtros.",
    showing: "{count} propiedades",
  },
  amenities: {
    pool: "Alberca",
    jacuzzi: "Jacuzzi",
    wifi: "Wifi",
    "fire-pit": "Fogata / chimenea",
    terrace: "Terraza",
    "vineyard-view": "Vista al valle",
    "wine-cellar": "Cava de vinos",
    spa: "Spa",
    "pet-friendly": "Pet friendly",
    breakfast: "Desayuno incluido",
    bbq: "Asador",
    patio: "Patio",
  },
  calendar: {
    prevMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    months: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    weekdays: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
  },
  footer: {
    brand: "Hospedajes Valle de Guadalupe",
    tagline: "Hospedajes boutique entre viñedos y montañas.",
    copyright: "Todos los derechos reservados.",
    poweredBy: "Powered by",
  },
} as const

const en: typeof es = {
  nav: {
    properties: "Properties",
    experiences: "Discover the Valley",
    reviews: "Reviews",
    management: "Management",
    contact: "Contact",
    home: "Home",
    mainAria: "Main navigation",
    menuLabel: "Sections",
    menuToggleAria: "Open sections menu",
  },
  common: {
    close: "Close",
    ready: "Done",
    send: "Send",
    requestInfo: "Request information",
    preReserve: "Pre-reserve",
    preReserveShort: "Book",
    brandAria: "Hospedajes en Valle de Guadalupe — Home",
    language: "Language",
  },
  hero: {
    bgAlt: "Vineyards and mountains in Valle de Guadalupe at sunrise",
    title1: "Immerse yourself in",
    title2: "Valle de Guadalupe",
    subtitle:
      "Curated properties among vineyards and mountains. Scroll to dive into the valley and discover your next stay.",
    location: "Valle de Guadalupe, B.C.",
    propertiesCount: "+{count} boutique stays",
    certifiedHost: "Certified host",
    diveIn: "Dive in",
    featuredTitle: "Featured",
    featuredTitleEm: "properties",
    featuredSubtitle: "Boutique stays in the heart of the valley. Swipe to explore all our properties.",
  },
  discoverValley: {
    title: "Discover the Valley",
    subtitle: "More than a stay — a full immersion in Mexico's wine capital.",
    dragHint: "Swipe up or down",
    progressAria: "Gallery progress",
    progressRemaining: "{count} left",
    cards: {
      "ruta-del-vino": {
        title: "Wine Route",
        description: "Private tastings and tours of the valley's finest boutique wineries.",
      },
      "alta-gastronomia": {
        title: "Fine Dining",
        description: "Farm-to-table restaurants and world-class author cuisine.",
      },
      "atardeceres-y-fuego": {
        title: "Sunsets & Fire",
        description: "Cool evenings by the fire pit with local wines under the stars.",
      },
      "relax-y-bienestar": {
        title: "Relax & Wellness",
        description: "Total disconnect with hot tubs and private pools.",
      },
      "paisajes-de-ensueno": {
        title: "Dream Landscapes",
        description: "Iconic panoramic views of mountains and olive groves at every stay.",
      },
    },
  },
  reviews: {
    title: "Reviews",
    subtitle: "What guests say after experiencing wine country with us.",
    average: "4.9",
    averageLabel: "Guest average",
    total: "120+",
    totalLabel: "Verified reviews",
    items: [
      {
        name: "María González",
        origin: "Mexico City",
        property: "Villa de Piedra",
        quote:
          "Waking up to vineyard views was magical. The home was spotless, the host was attentive, and the restaurant recommendations were an incredible bonus.",
        date: "March 2026",
        rating: 5,
      },
      {
        name: "James & Sarah Miller",
        origin: "San Diego, CA",
        property: "Glamping Dome",
        quote:
          "A perfect blend of nature and comfort. Stargazing from the dome at night and wine tasting during the day — we didn't want to leave.",
        date: "February 2026",
        rating: 5,
      },
      {
        name: "Roberto & Ana López",
        origin: "Tijuana, B.C.",
        property: "Wood Cabin",
        quote:
          "The perfect weekend escape. A private pool at sunset, the peace of the valley, and flawless service from start to finish.",
        date: "January 2026",
        rating: 5,
      },
      {
        name: "Emily Chen",
        origin: "Los Angeles, CA",
        property: "Vineyard Suite",
        quote:
          "Every detail was thoughtfully curated. From check-in to local wine recommendations, it felt like a boutique hotel in the middle of the vineyards.",
        date: "December 2025",
        rating: 5,
      },
    ],
  },
  owners: {
    title: "Do you own a property in",
    titleEm: "Valle de Guadalupe?",
    subtitle: "We manage it for you and turn it into a profitable boutique stay.",
    cta: "I want to manage my property",
  },
  propertyModal: {
    label: "Property management",
    title: "Do you own a property in Valle de Guadalupe?",
    subtitle: "Tell us about your property and we'll reach out with a tailored management proposal.",
    name: "Full name",
    phone: "Phone",
    email: "Email",
    aboutLabel: "Tell us about your property",
    aboutPlaceholder: "Property type, location, capacity, amenities, current condition...",
    successTitle: "Request received!",
    successBody: "Thank you, {name}. Our team will review your property details and contact you soon.",
  },
  preReservation: {
    title: "Pre-reserve your stay",
    subtitle: "Complete your details and choose your dates. The manager will confirm availability with you.",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    guest: "guest",
    guests: "guests",
    propertiesTitle: "Properties of interest",
    selected: "selected",
    selectedPlural: "selected",
    multiSelect: "You can choose more than one property.",
    datesTitle: "Stay dates",
    checkIn: "Check-in",
    checkOut: "Check-out",
    calendarHint: "Select your check-in date, then your check-out date on the calendar.",
    submit: "Send pre-reservation",
    disclaimer:
      "This is a pre-reservation request. The property manager will confirm availability before finalizing.",
    successTitle: "Pre-reservation received!",
    successBodySingle:
      "Thank you, {name}. The manager of your selected property will review your request and contact you soon to confirm availability and finalize your booking.",
    successBodyMulti:
      "Thank you, {name}. The manager of your selected properties will review your request and contact you soon to confirm availability and finalize your booking.",
  },
  quickLook: {
    capacity: "CAPACITY",
    amenities: "AMENITIES",
    includes: "INCLUDES",
    includesList: [
      "Private check-in and assisted arrival",
      "Hotel-grade cleaning and linens",
      "Winery and restaurant recommendations",
      "24/7 host support",
    ],
  },
  carousel: {
    prev: "Previous property",
    next: "Next property",
    goTo: "Go to {name}",
    viewDetails: "View details for {name}",
    fullList: "Full list",
  },
  propertiesPage: {
    title: "All properties",
    subtitle: "Browse our full catalog in Valle de Guadalupe and find your ideal stay.",
    filtersLabel: "Filter by amenities",
    clearFilters: "Clear filters",
    noResults: "No properties match these amenities. Try different filters.",
    showing: "{count} properties",
  },
  amenities: {
    pool: "Pool",
    jacuzzi: "Jacuzzi",
    wifi: "WiFi",
    "fire-pit": "Fire pit / fireplace",
    terrace: "Terrace",
    "vineyard-view": "Valley view",
    "wine-cellar": "Wine cellar",
    spa: "Spa",
    "pet-friendly": "Pet friendly",
    breakfast: "Breakfast included",
    bbq: "BBQ grill",
    patio: "Patio",
  },
  calendar: {
    prevMonth: "Previous month",
    nextMonth: "Next month",
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  },
  footer: {
    brand: "Hospedajes Valle de Guadalupe",
    tagline: "Boutique stays among vineyards and mountains.",
    copyright: "All rights reserved.",
    poweredBy: "Powered by",
  },
}

export const translations = { es, en } as const

export function getTranslation(locale: Locale) {
  return translations[locale]
}

export function interpolate(text: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), text)
}

export function getDateLocale(locale: Locale) {
  return locale === "es" ? "es-MX" : "en-US"
}
