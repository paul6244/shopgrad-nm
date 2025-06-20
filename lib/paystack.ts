interface PaystackConfig {
  publicKey: string
  secretKey: string
  baseUrl: string
}

interface PaystackInitializeData {
  email: string
  amount: number // in kobo (smallest currency unit)
  currency?: string
  reference?: string
  callback_url?: string
  metadata?: Record<string, any>
  channels?: string[]
}

interface PaystackResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
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
    ip_address: string
    metadata: Record<string, any>
    log: any
    fees: number
    fees_split: any
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
      account_name: string | null
    }
    customer: {
      id: number
      first_name: string | null
      last_name: string | null
      email: string
      customer_code: string
      phone: string | null
      metadata: Record<string, any>
      risk_action: string
      international_format_phone: string | null
    }
    plan: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
    requested_amount: number
    pos_transaction_data: any
    source: any
    fees_breakdown: any
  }
}

class PaystackService {
  private config: PaystackConfig

  constructor() {
    this.config = {
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_public_key_here",
      secretKey: process.env.PAYSTACK_SECRET_KEY || "sk_test_your_secret_key_here",
      baseUrl: "https://api.paystack.co",
    }
  }

  // Initialize payment transaction
  async initializePayment(data: PaystackInitializeData): Promise<PaystackResponse> {
    try {
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

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Paystack initialization error:", error)
      throw new Error("Failed to initialize payment")
    }
  }

  // Verify payment transaction
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.secretKey}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Paystack verification error:", error)
      throw new Error("Failed to verify payment")
    }
  }

  // Generate payment reference
  generateReference(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `SHOPGRAD_${timestamp}_${random}`
  }

  // Convert amount to kobo (Paystack uses kobo for GHS)
  convertToKobo(amount: number): number {
    return Math.round(amount * 100)
  }

  // Convert amount from kobo to cedis
  convertFromKobo(amount: number): number {
    return amount / 100
  }

  // Get public key for frontend
  getPublicKey(): string {
    return this.config.publicKey
  }
}

export const paystackService = new PaystackService()
export type { PaystackInitializeData, PaystackResponse, PaystackVerifyResponse }
