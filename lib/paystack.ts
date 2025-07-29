interface PaystackConfig {
  publicKey: string
  secretKey: string
  baseUrl: string
}

interface PaystackInitializeData {
  email: string
  amount: number // in pesewas (smallest currency unit for GHS)
  currency?: string
  reference?: string
  callback_url?: string
  metadata?: Record<string, any>
  channels?: string[]
}

interface PaystackResponse {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data?: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    customer: {
      id: number
      email: string
      customer_code: string
    }
  }
}

class PaystackService {
  private config: PaystackConfig

  constructor() {
    this.config = {
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_1e034e6aa5087869e8799bcc4511eeabcfbfc847",
      secretKey: process.env.PAYSTACK_SECRET_KEY || "sk_test_6e8b9922413610e3c5dada7afa87589df7deacb3",
      baseUrl: "https://api.paystack.co",
    }
  }

  // Initialize payment transaction
  async initializePayment(data: PaystackInitializeData): Promise<PaystackResponse> {
    try {
      if (!this.config.secretKey) {
        throw new Error("Paystack secret key not configured")
      }

      const response = await fetch(`${this.config.baseUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          currency: data.currency || "GHS",
          channels: data.channels || ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Paystack API error:", errorText)
        throw new Error(`Paystack API error: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Paystack initialization error:", error)
      return {
        status: false,
        message: error instanceof Error ? error.message : "Failed to initialize payment",
      }
    }
  }

  // Verify payment transaction
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      if (!this.config.secretKey) {
        throw new Error("Paystack secret key not configured")
      }

      const response = await fetch(`${this.config.baseUrl}/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.secretKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Paystack verification error:", errorText)
        throw new Error(`Paystack verification error: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Paystack verification error:", error)
      return {
        status: false,
        message: error instanceof Error ? error.message : "Failed to verify payment",
      }
    }
  }

  // Generate payment reference
  generateReference(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000000)
    return `SHOPGRAD_${timestamp}_${random}`
  }

  // Convert amount to pesewas (Paystack uses pesewas for GHS)
  convertToPesewas(amount: number): number {
    return Math.round(amount * 100)
  }

  // Convert amount from pesewas to cedis
  convertFromPesewas(amount: number): number {
    return amount / 100
  }

  // Get public key for frontend
  getPublicKey(): string {
    return this.config.publicKey
  }
}

export const paystackService = new PaystackService()
export type { PaystackInitializeData, PaystackResponse, PaystackVerifyResponse }
