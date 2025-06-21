import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/hooks/use-cart"
import { AuthProvider } from "@/hooks/use-auth"
import { FavoritesProvider } from "@/hooks/use-favorites"
import { EmailNotificationProvider } from "@/hooks/use-email-notifications"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShopGrad - Shopping App",
  description: "A beautiful shopping app with gradient design",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <EmailNotificationProvider>
            <FavoritesProvider>
              <CartProvider>{children}</CartProvider>
            </FavoritesProvider>
          </EmailNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
