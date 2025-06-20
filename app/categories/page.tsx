"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Search } from "lucide-react"
import { useRouter } from "next/navigation"

// Updated category data with accurate product counts
const categories = [
  {
    id: "electronics",
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&h=300&fit=crop&q=80",
    description: "Latest gadgets and tech",
    itemCount: 20,
  },
  {
    id: "fashion",
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=300&fit=crop&q=80",
    description: "Clothing, accessories, and more",
    itemCount: 25,
  },
  {
    id: "home",
    name: "Home",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&h=300&fit=crop&q=80",
    description: "Furniture and home decor",
    itemCount: 20,
  },
  {
    id: "fitness",
    name: "Fitness",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=300&fit=crop&q=80",
    description: "Equipment and workout gear",
    itemCount: 15,
  },
  {
    id: "beauty",
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=300&fit=crop&q=80",
    description: "Skincare and cosmetics",
    itemCount: 15,
  },
  {
    id: "books",
    name: "Books",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&h=300&fit=crop&q=80",
    description: "Books and magazines",
    itemCount: 10,
  },
]

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/?category=${categoryId}`)
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
        <h1 className="text-3xl font-bold text-white mb-6">Categories</h1>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full py-3 pl-10 pr-4 bg-white bg-opacity-90 text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="relative h-40">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                  unoptimized={category.image.startsWith("http")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.itemCount} products</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-white">No categories found matching "{searchQuery}"</p>
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
                className={`flex flex-col items-center ${
                  item.name === "Categories" ? "text-rose-500 font-medium" : ""
                }`}
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
