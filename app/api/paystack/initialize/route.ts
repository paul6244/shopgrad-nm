import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, currency, metadata, callback_url } = body

    if (!email || !amount) {
      return NextResponse.json({ error: "Email and amount are required" }, { status: 400 })
    }

    const reference = paystackService.generateReference()
    const amountInKobo = paystackService.convertToKobo(amount)

    const response = await paystackService.initializePayment({
      email,
      amount: amountInKobo,
      currency: currency || "GHS",
      reference,
      metadata: metadata || {},
      callback_url,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Paystack initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
