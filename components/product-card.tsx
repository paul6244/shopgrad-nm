"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useFavorites } from "@/hooks/use-favorites"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
}

interface ProductCardProps {
  product: Product
  featured?: boolean
  isFavorite?: boolean
}

export default function ProductCard({
  product,
  featured = false,
  isFavorite: initialFavorite = false,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [isProductFavorite, setIsProductFavorite] = useState(initialFavorite)

  useEffect(() => {
    setIsProductFavorite(isFavorite(product.id) || initialFavorite)
  }, [product.id, isFavorite, initialFavorite])

  const handleFavoriteToggle = () => {
    if (isProductFavorite) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
    setIsProductFavorite(!isProductFavorite)
  }

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
        featured ? "border-2 border-rose-300" : ""
      }`}
    >
      <div className="relative">
        <div className={`relative ${featured ? "aspect-[4/3]" : "aspect-square"}`}>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized={product.image.startsWith("http")}
          />
        </div>
        {featured && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-1 rounded-full">Featured</div>
        )}
        <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm" onClick={handleFavoriteToggle}>
          <Heart className={`h-5 w-5 ${isProductFavorite ? "fill-rose-500 text-rose-500" : "text-gray-400"}`} />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold">₵{product.price.toFixed(2)}</span>
          <button
            className="p-1.5 bg-rose-100 rounded-full text-rose-500 hover:bg-rose-200 transition-colors"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
