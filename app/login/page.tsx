"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
      router.push("/")
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-rose-200 via-rose-300 to-purple-500">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-3 text-black">
        <div>9:41</div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3">•••</div>
          <div className="h-3 w-3">📶</div>
          <div className="h-3 w-3">🔋</div>
        </div>
      </div>

      <div className="px-6 py-4">
        <Link href="/" className="inline-flex items-center text-black">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Shop
        </Link>
      </div>

      <main className="flex-1 flex flex-col px-6 pt-10">
        <h1 className="text-4xl font-bold text-black mb-12">Sign in</h1>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-black" />
            </div>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full py-4 pl-12 pr-4 bg-[#f2f2f7] text-gray-700 rounded-full focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-black" />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="w-full py-4 pl-12 pr-4 bg-[#f2f2f7] text-gray-700 rounded-full focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-black underline">
              Forgot password?
            </Link>
          </div>

          <div className="flex justify-center mt-8">
            <button type="submit" className="bg-[#f2f2f7] text-black font-bold py-4 px-8 rounded-full min-w-[160px]">
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-black">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium underline">
              Sign Up
            </Link>
          </p>
        </div>
      </main>

      {/* iPhone Home Indicator */}
      <div className="h-8 flex justify-center items-end pb-1">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  )
}
