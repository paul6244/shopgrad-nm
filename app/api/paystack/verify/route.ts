import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/paystack"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    const response = await paystackService.verifyPayment(reference)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Paystack verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
