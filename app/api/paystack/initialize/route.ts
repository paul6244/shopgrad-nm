import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Paystack initialize route called")

    const body = await request.json()
    console.log("Request body:", body)

    const { email, amount, currency, metadata, callback_url } = body

    // Validate required fields
    if (!email || !amount) {
      console.log("Missing required fields:", { email: !!email, amount: !!amount })
      return NextResponse.json(
        {
          status: false,
          message: "Email and amount are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email)
      return NextResponse.json(
        {
          status: false,
          message: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      console.log("Invalid amount:", amount)
      return NextResponse.json(
        {
          status: false,
          message: "Amount must be a positive number",
        },
        { status: 400 },
      )
    }

    // Check for Paystack secret key
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    console.log("Secret key exists:", !!secretKey)
    console.log("Secret key starts with sk_:", secretKey?.startsWith("sk_"))

    if (!secretKey || secretKey === "sk_test_default" || !secretKey.startsWith("sk_")) {
      console.log("Paystack secret key not properly configured:", secretKey?.substring(0, 10) + "...")

      // For development, provide a helpful error message
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          {
            status: false,
            message: "Paystack secret key not configured. Please add PAYSTACK_SECRET_KEY to your .env.local file.",
            debug: {
              hasSecretKey: !!secretKey,
              keyPrefix: secretKey?.substring(0, 7),
              nodeEnv: process.env.NODE_ENV,
            },
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          status: false,
          message: "Payment service not configured. Please contact support.",
        },
        { status: 500 },
      )
    }

    // Generate reference
    const reference = `SHOPGRAD_${Date.now()}_${Math.floor(Math.random() * 1000000)}`

    // Convert amount to pesewas (multiply by 100 for GHS)
    const amountInPesewas = Math.round(amount * 100)

    console.log("Initializing payment with:", {
      email,
      amount: amountInPesewas,
      reference,
      currency: currency || "GHS",
    })

    // Initialize payment with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInPesewas,
        currency: currency || "GHS",
        reference,
        metadata: metadata || {},
        callback_url,
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      }),
    })

    console.log("Paystack response status:", paystackResponse.status)

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text()
      console.error("Paystack API error:", errorText)

      // Try to parse error response
      let errorMessage = `Payment service error: ${paystackResponse.status}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorMessage
      } catch (e) {
        // Keep default error message
      }

      return NextResponse.json(
        {
          status: false,
          message: errorMessage,
          debug: process.env.NODE_ENV === "development" ? { paystackError: errorText } : undefined,
        },
        { status: 500 },
      )
    }

    const result = await paystackResponse.json()
    console.log("Paystack response:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Paystack initialization error:", error)
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
