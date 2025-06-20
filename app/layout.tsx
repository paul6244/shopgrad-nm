import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/hooks/use-cart"
import { AuthProvider } from "@/hooks/use-auth"
import { FavoritesProvider } from "@/hooks/use-favorites"
import { PaystackScript } from "@/components/paystack-script"
import { Toaster } from "@/components/ui/sonner"
import { EmailNotificationProvider } from "@/hooks/use-email-notifications"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShopGrad - Your Graduation Shopping Destination",
  description: "Find everything you need for your graduation and beyond at ShopGrad",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <EmailNotificationProvider>
              <CartProvider>
                <FavoritesProvider>
                  {children}
                  <PaystackScript />
                  <Toaster />
                </FavoritesProvider>
              </CartProvider>
            </EmailNotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
