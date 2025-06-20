"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShoppingBag, Heart, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-rose-200 via-rose-300 to-purple-500">
      <div className="px-4 py-4 sm:px-6">
        <Link href="/" className="inline-flex items-center text-black">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Shop
        </Link>
      </div>

      <main className="flex-1 container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-rose-400 to-purple-500 px-4 py-6 sm:px-6 sm:py-8 text-white">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-500 text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
                <p className="opacity-90 text-sm sm:text-base">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <Link
                href="/profile/orders"
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 focus:bg-gray-200 active:bg-gray-200 transition outline-none ring-0 focus:ring-2 focus:ring-rose-400"
                tabIndex={0}
              >
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-3 text-rose-500" />
                  <span>My Orders</span>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </Link>

              <Link
                href="/profile/wishlist"
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 focus:bg-gray-200 active:bg-gray-200 transition outline-none ring-0 focus:ring-2 focus:ring-rose-400"
                tabIndex={0}
              >
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-3 text-rose-500" />
                  <span>Wishlist</span>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </Link>

              <Link
                href="/profile/settings"
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 focus:bg-gray-200 active:bg-gray-200 transition outline-none ring-0 focus:ring-2 focus:ring-rose-400"
                tabIndex={0}
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-3 text-rose-500" />
                  <span>Settings</span>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center justify-between w-full p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-3 text-rose-500" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
