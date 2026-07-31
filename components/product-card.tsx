"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getBadgeLabel } from "@/lib/i18n/products"
import { useLanguage } from "./language-provider"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: string
    image: string
    badge?: "Nuevo" | "Popular" | "Limitado"
    materials: string[]
    quickLookImages: string[]
    dimensions: string
  }
  onQuickLook: (product: ProductCardProps["product"]) => void
  priority?: boolean
}

export function ProductCard({ product, onQuickLook, priority = false }: ProductCardProps) {
  const { locale, tf, t } = useLanguage()

  return (
    <motion.div
      className="group relative bg-white overflow-hidden cursor-pointer"
      style={{
        borderRadius: "24px",
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px",
      }}
      onClick={() => onQuickLook(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onQuickLook(product)
        }
      }}
      aria-label={tf(t.carousel.viewDetails, { name: product.name })}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-20">
          <span
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm",
              product.badge === "Nuevo" && "bg-valle-olive-600/90 text-white",
              product.badge === "Popular" && "bg-valle-wine-600/90 text-white",
              product.badge === "Limitado" && "bg-valle-gold-600/90 text-white",
            )}
          >
            {getBadgeLabel(product.badge, locale)}
          </span>
        </div>
      )}

      {/* Product Image */}
      <div
        className="relative overflow-hidden bg-valle-sage-200"
        style={{ aspectRatio: "25/36" }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          priority={priority}
          loading="eager"
          sizes="(max-width: 768px) 78vw, 380px"
        />
      </div>

      {/* Product Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 backdrop-blur-md"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 40%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 40%, transparent 80%)",
          }}
        />
        <div
          className="absolute inset-0 backdrop-blur-lg"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 20%, transparent 60%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 20%, transparent 60%)",
          }}
        />
        <div className="relative z-10">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 drop-shadow-sm">{product.name}</h3>
            <p className="text-sm text-white/90 mb-2 drop-shadow-sm">{product.materials.join(", ")}</p>
            <span className="text-xl font-bold text-white drop-shadow-sm">{product.price}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
