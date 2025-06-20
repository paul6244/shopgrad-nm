"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function WishlistPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-rose-200 via-rose-300 to-purple-500">
      <div className="px-6 py-4">
        <Link href="/profile" className="inline-flex items-center text-black">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Profile
        </Link>
      </div>
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">My Wishlist</h1>
        <p className="text-white">Your wishlist is empty.</p>
      </main>
    </div>
  )
}
