import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Paystack verify route called")

    const body = await request.json()
    console.log("Verify request body:", body)

    const { reference } = body

    if (!reference) {
      console.log("Missing reference")
      return NextResponse.json(
        {
          status: false,
          message: "Payment reference is required",
        },
        { status: 400 },
      )
    }

    // Check for Paystack secret key
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey || secretKey === "sk_test_default") {
      console.log("Paystack secret key not configured")
      return NextResponse.json(
        {
          status: false,
          message: "Payment service not configured. Please contact support.",
        },
        { status: 500 },
      )
    }

    console.log("Verifying payment with reference:", reference)

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Paystack verify response status:", paystackResponse.status)

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text()
      console.error("Paystack verification error:", errorText)
      return NextResponse.json(
        {
          status: false,
          message: `Payment verification error: ${paystackResponse.status}`,
        },
        { status: 500 },
      )
    }

    const result = await paystackResponse.json()
    console.log("Paystack verify response:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Paystack verification error:", error)
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
