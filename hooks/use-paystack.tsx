"use client"

import { useState } from "react"
import { paystackService } from "@/lib/paystack"
import type { PaystackInitializeData } from "@/lib/paystack"

interface UsePaystackProps {
  onSuccess?: (reference: string) => void
  onError?: (error: string) => void
  onClose?: () => void
}

interface PaystackPopupOptions {
  key: string
  email: string
  amount: number
  currency?: string
  ref: string
  metadata?: Record<string, any>
  callback: (response: { reference: string }) => void
  onClose: () => void
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackPopupOptions) => {
        openIframe: () => void
      }
    }
  }
}

export function usePaystack({ onSuccess, onError, onClose }: UsePaystackProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePayment = async (paymentData: PaystackInitializeData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Generate reference if not provided
      const reference = paymentData.reference || paystackService.generateReference()

      // Convert amount to kobo
      const amountInKobo = paystackService.convertToKobo(paymentData.amount)

      // Check if Paystack script is loaded
      if (typeof window !== "undefined" && window.PaystackPop) {
        // Use Paystack Popup
        const popup = window.PaystackPop.setup({
          key: paystackService.getPublicKey(),
          email: paymentData.email,
          amount: amountInKobo,
          currency: paymentData.currency || "GHS",
          ref: reference,
          metadata: paymentData.metadata || {},
          callback: (response) => {
            setIsLoading(false)
            onSuccess?.(response.reference)
          },
          onClose: () => {
            setIsLoading(false)
            onClose?.()
          },
        })

        popup.openIframe()
      } else {
        // Fallback to redirect method
        const response = await paystackService.initializePayment({
          ...paymentData,
          reference,
          amount: amountInKobo,
        })

        if (response.status) {
          // Redirect to Paystack payment page
          window.location.href = response.data.authorization_url
        } else {
          throw new Error(response.message || "Failed to initialize payment")
        }
      }
    } catch (err) {
      setIsLoading(false)
      const errorMessage = err instanceof Error ? err.message : "Payment initialization failed"
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }

  const verifyPayment = async (reference: string) => {
    try {
      const response = await paystackService.verifyPayment(reference)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment verification failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    initializePayment,
    verifyPayment,
    isLoading,
    error,
  }
}
