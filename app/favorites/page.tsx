"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import ProductCard from "@/components/product-card"
import { useFavorites } from "@/hooks/use-favorites"

export default function FavoritesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-rose-200 via-rose-300 to-purple-500">
      {/* Header */}
      <div className="px-6 py-4">
        <Link href="/" className="inline-flex items-center text-black">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Shop
        </Link>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Your Favorites</h1>
          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white bg-opacity-90 rounded-xl p-8 text-center">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Items you favorite will appear here. Browse products and click the heart icon to add them to your
              favorites.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} isFavorite={true} />
            ))}
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="sticky bottom-0 bg-white bg-opacity-90 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            {[
              { name: "Home", href: "/" },
              { name: "Categories", href: "/categories" },
              { name: "Favorites", href: "/favorites" },
              { name: "Profile", href: "/profile" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center ${item.name === "Favorites" ? "text-rose-500 font-medium" : ""}`}
              >
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
