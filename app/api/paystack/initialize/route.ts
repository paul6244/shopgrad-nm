import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Paystack Initialize Route Called ===")

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log("Request body parsed:", body)
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          status: false,
          message: "Invalid JSON in request body",
        },
        { status: 400 },
      )
    }

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
    console.log("Environment check:", {
      hasSecretKey: !!secretKey,
      keyPrefix: secretKey?.substring(0, 7),
      nodeEnv: process.env.NODE_ENV,
    })

    if (!secretKey || secretKey === "sk_test_default") {
      console.log("Paystack secret key not configured")
      return NextResponse.json(
        {
          status: false,
          message: "Payment service not configured. Please add PAYSTACK_SECRET_KEY to environment variables.",
          debug:
            process.env.NODE_ENV === "development"
              ? {
                  hasSecretKey: !!secretKey,
                  keyValue: secretKey?.substring(0, 10) + "...",
                  allEnvKeys: Object.keys(process.env).filter((key) => key.includes("PAYSTACK")),
                }
              : undefined,
        },
        { status: 500 },
      )
    }

    // Validate secret key format
    if (!secretKey.startsWith("sk_")) {
      console.log("Invalid secret key format")
      return NextResponse.json(
        {
          status: false,
          message: "Invalid Paystack secret key format",
        },
        { status: 500 },
      )
    }

    // Generate reference
    const reference = `SHOPGRAD_${Date.now()}_${Math.floor(Math.random() * 1000000)}`

    // Convert amount to pesewas (multiply by 100 for GHS)
    const amountInPesewas = Math.round(amount * 100)

    console.log("Initializing payment with Paystack:", {
      email,
      amount: amountInPesewas,
      reference,
      currency: currency || "GHS",
    })

    // Initialize payment with Paystack
    const paystackPayload = {
      email,
      amount: amountInPesewas,
      currency: currency || "GHS",
      reference,
      metadata: metadata || {},
      callback_url,
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }

    console.log("Paystack API payload:", paystackPayload)

    let paystackResponse
    try {
      paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackPayload),
      })
    } catch (fetchError) {
      console.error("Failed to fetch Paystack API:", fetchError)
      return NextResponse.json(
        {
          status: false,
          message: "Failed to connect to payment service",
          debug:
            process.env.NODE_ENV === "development"
              ? {
                  error: fetchError instanceof Error ? fetchError.message : "Unknown fetch error",
                }
              : undefined,
        },
        { status: 500 },
      )
    }

    console.log("Paystack response status:", paystackResponse.status)
    console.log("Paystack response headers:", Object.fromEntries(paystackResponse.headers.entries()))

    // Get Paystack response text
    let paystackResponseText
    try {
      paystackResponseText = await paystackResponse.text()
      console.log("Paystack response text:", paystackResponseText)
    } catch (textError) {
      console.error("Failed to read Paystack response:", textError)
      return NextResponse.json(
        {
          status: false,
          message: "Failed to read payment service response",
        },
        { status: 500 },
      )
    }

    if (!paystackResponse.ok) {
      console.error("Paystack API error:", paystackResponseText)

      // Try to parse Paystack error response
      let errorMessage = `Payment service error: ${paystackResponse.status}`
      let debugInfo = { paystackError: paystackResponseText }

      try {
        const errorJson = JSON.parse(paystackResponseText)
        errorMessage = errorJson.message || errorMessage
        debugInfo = { ...debugInfo, paystackErrorData: errorJson }
      } catch (parseError) {
        console.error("Failed to parse Paystack error response:", parseError)
      }

      return NextResponse.json(
        {
          status: false,
          message: errorMessage,
          debug: process.env.NODE_ENV === "development" ? debugInfo : undefined,
        },
        { status: 500 },
      )
    }

    // Parse successful Paystack response
    let result
    try {
      result = JSON.parse(paystackResponseText)
      console.log("Paystack success response:", result)
    } catch (parseError) {
      console.error("Failed to parse Paystack success response:", parseError)
      return NextResponse.json(
        {
          status: false,
          message: "Invalid response from payment service",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("=== Paystack Initialize Route Error ===", error)
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        debug:
          process.env.NODE_ENV === "development"
            ? {
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString(),
              }
            : undefined,
      },
      { status: 500 },
    )
  }
}
