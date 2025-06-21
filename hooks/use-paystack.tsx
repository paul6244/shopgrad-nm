"use client"

import { useState, useCallback } from "react"

interface PaystackPaymentData {
  email: string
  amount: number
  reference?: string
  metadata?: Record<string, any>
  onSuccess?: (reference: string) => void
  onError?: (error: string) => void
  onClose?: () => void
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void
      }
    }
  }
}

export function usePaystack() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePayment = useCallback(async (paymentData: PaystackPaymentData) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Initializing payment with data:", paymentData)

      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: paymentData.email,
          amount: paymentData.amount,
          metadata: paymentData.metadata,
          reference: paymentData.reference,
        }),
      })

      console.log("API response status:", response.status)

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check content type
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const result = await response.json()
      console.log("API response data:", result)

      if (!result.status) {
        throw new Error(result.message || "Failed to initialize payment")
      }

      // Check if we have Paystack popup available
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

      if (!publicKey || publicKey === "pk_test_default") {
        throw new Error("Paystack public key not configured")
      }

      // Use Paystack Popup if available
      if (typeof window !== "undefined" && window.PaystackPop) {
        console.log("Using Paystack popup")
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: paymentData.email,
          amount: Math.round(paymentData.amount * 100), // Convert to pesewas
          currency: "GHS",
          reference: result.data.reference,
          metadata: paymentData.metadata || {},
          callback: (response: any) => {
            console.log("Payment successful:", response)
            setIsLoading(false)
            paymentData.onSuccess?.(response.reference)
          },
          onClose: () => {
            console.log("Payment popup closed")
            setIsLoading(false)
            paymentData.onClose?.()
          },
        })

        handler.openIframe()
      } else {
        // Fallback to redirect
        console.log("Using redirect method")
        if (result.data?.authorization_url) {
          window.location.href = result.data.authorization_url
        } else {
          throw new Error("No authorization URL received")
        }
      }

      return result
    } catch (err) {
      console.error("Payment initialization error:", err)
      setIsLoading(false)
      const errorMessage = err instanceof Error ? err.message : "Payment initialization failed"
      setError(errorMessage)
      paymentData.onError?.(errorMessage)
      throw err
    }
  }, [])

  const verifyPayment = useCallback(async (reference: string) => {
    try {
      console.log("Verifying payment:", reference)

      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      console.log("Verify response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Verify error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const result = await response.json()
      console.log("Verify response data:", result)

      return result
    } catch (err) {
      console.error("Payment verification error:", err)
      const errorMessage = err instanceof Error ? err.message : "Payment verification failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    initializePayment,
    verifyPayment,
    isLoading,
    error,
  }
}
