import type { LucideIcon } from "lucide-react"
import {
  Baby,
  Bike,
  Binoculars,
  Car,
  ChefHat,
  CircleParking,
  Dumbbell,
  Flower2,
  Gamepad2,
  Goal,
  Leaf,
  Music,
  Tent,
  Trophy,
  Tv,
  Volleyball,
  Zap,
} from "lucide-react"

export const CUSTOM_AMENITY_ICON_IDS = [
  "goal",
  "volleyball",
  "dumbbell",
  "trophy",
  "bike",
  "car",
  "parking",
  "gamepad",
  "tv",
  "music",
  "chef-hat",
  "baby",
  "tent",
  "binoculars",
  "flower",
  "leaf",
  "zap",
] as const

export type CustomAmenityIconId = (typeof CUSTOM_AMENITY_ICON_IDS)[number]

export type CustomAmenityIconOption = {
  id: CustomAmenityIconId
  label: string
  color: string
  icon: LucideIcon
}

export const CUSTOM_AMENITY_ICONS: CustomAmenityIconOption[] = [
  { id: "goal", label: "Cancha / fútbol", color: "#527364", icon: Goal },
  { id: "volleyball", label: "Voleibol", color: "#3b7a8c", icon: Volleyball },
  { id: "dumbbell", label: "Gimnasio", color: "#6b5b95", icon: Dumbbell },
  { id: "trophy", label: "Deportes", color: "#b8923a", icon: Trophy },
  { id: "bike", label: "Bicicletas", color: "#6b8e5a", icon: Bike },
  { id: "car", label: "Estacionamiento", color: "#5c6b73", icon: Car },
  { id: "parking", label: "Parking", color: "#5c6b73", icon: CircleParking },
  { id: "gamepad", label: "Juegos", color: "#7b2d3a", icon: Gamepad2 },
  { id: "tv", label: "Cine / TV", color: "#3b4a6b", icon: Tv },
  { id: "music", label: "Música", color: "#7b2d3a", icon: Music },
  { id: "chef-hat", label: "Cocina chef", color: "#b5651d", icon: ChefHat },
  { id: "baby", label: "Infantil", color: "#d4a5a5", icon: Baby },
  { id: "tent", label: "Camping", color: "#8a5a44", icon: Tent },
  { id: "binoculars", label: "Naturaleza", color: "#527364", icon: Binoculars },
  { id: "flower", label: "Jardín", color: "#6b8e5a", icon: Flower2 },
  { id: "leaf", label: "Eco / huerto", color: "#6b8e5a", icon: Leaf },
  { id: "zap", label: "Carga EV", color: "#b8923a", icon: Zap },
]

export const CUSTOM_AMENITY_ICONS_BY_ID = Object.fromEntries(
  CUSTOM_AMENITY_ICONS.map((item) => [item.id, item]),
) as Record<CustomAmenityIconId, CustomAmenityIconOption>

export function getCustomAmenityIcon(id: CustomAmenityIconId) {
  return CUSTOM_AMENITY_ICONS_BY_ID[id]
}

export function isCustomAmenityIconId(value: string): value is CustomAmenityIconId {
  return (CUSTOM_AMENITY_ICON_IDS as readonly string[]).includes(value)
}
