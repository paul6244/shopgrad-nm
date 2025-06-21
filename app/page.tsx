"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ShoppingBag } from "lucide-react"
import ProductCard from "@/components/product-card"
import CartDrawer from "@/components/cart-drawer"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useFavorites } from "@/hooks/use-favorites"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { featuredProducts, generateCategoryProducts, productCategories } from "@/data/products"

export default function ShoppingApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const { cartItems, cartTotal } = useCart()
  const { user } = useAuth()
  const { isFavorite } = useFavorites()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam)
      setSearchQuery("")
    }
  }, [categoryParam])

  // Generate products based on selected category
  const displayProducts = useMemo(() => {
    if (selectedCategory && selectedCategory !== "All") {
      const count = productCategories[selectedCategory as keyof typeof productCategories] || 50
      return generateCategoryProducts(selectedCategory, count)
    }

    if (searchQuery) {
      // Generate a subset of products for search
      const allCategories = Object.keys(productCategories)
      const searchResults: any[] = []

      allCategories.forEach((category) => {
        const categoryProducts = generateCategoryProducts(category, 20) // Limit for performance
        const filtered = categoryProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        searchResults.push(...filtered)
      })

      return searchResults.slice(0, 100) // Limit search results
    }

    return featuredProducts
  }, [selectedCategory, searchQuery])

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === "All" ? "" : category)
    setSearchQuery("")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-rose-200 via-rose-300 to-purple-500">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              ShopGrad
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm hidden md:inline">Hi, {user.name}</span>
                  <Link
                    href="/profile"
                    className="w-8 h-8 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full flex items-center justify-center text-white"
                  >
                    {user.name.charAt(0)}
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-rose-400 to-purple-500 text-white"
                >
                  Sign In
                </Link>
              )}
              <button className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full py-3 pl-10 pr-4 bg-[#f2f2f7] text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
          {["All", "Electronics", "Fashion", "Home", "Fitness", "Beauty", "Books"].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                (category === "All" && !selectedCategory) || selectedCategory === category
                  ? "bg-rose-500 text-white"
                  : "bg-white hover:bg-rose-100"
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}{" "}
              {category !== "All" && `(${productCategories[category as keyof typeof productCategories] || 0})`}
            </button>
          ))}
        </div>

        {/* Featured Products Section */}
        {!selectedCategory && !searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} featured isFavorite={isFavorite(product.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {selectedCategory ? `${selectedCategory} Products` : searchQuery ? "Search Results" : "All Products"}(
            {displayProducts.length})
          </h2>
          {selectedCategory && (
            <button onClick={() => setSelectedCategory("")} className="text-white underline hover:no-underline">
              View All Categories
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} isFavorite={isFavorite(product.id)} />
          ))}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-white">No products found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Load More Button for Categories */}
        {selectedCategory && displayProducts.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-white text-sm">
              Showing {displayProducts.length} products in {selectedCategory}
            </p>
          </div>
        )}

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 flex justify-center z-10 px-4">
            <Link
              href="/checkout"
              className="bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 px-8 rounded-full shadow-lg font-medium flex items-center"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Checkout (₵{cartTotal.toFixed(2)})
            </Link>
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
              { name: "Profile", href: user ? "/profile" : "/login" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center ${item.name === "Home" ? "text-rose-500 font-medium" : ""}`}
              >
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
