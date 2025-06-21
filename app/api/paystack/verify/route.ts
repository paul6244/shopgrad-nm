import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Paystack Verify Route Called ===")

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log("Verify request body:", body)
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
    console.log("Environment check:", {
      hasSecretKey: !!secretKey,
      keyPrefix: secretKey?.substring(0, 7),
    })

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

    if (!secretKey.startsWith("sk_")) {
      console.log("Invalid secret key format")
      return NextResponse.json(
        {
          status: false,
          message: "Invalid payment service configuration",
        },
        { status: 500 },
      )
    }

    console.log("Verifying payment with reference:", reference)

    // Verify payment with Paystack
    let paystackResponse
    try {
      paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      })
    } catch (fetchError) {
      console.error("Failed to fetch Paystack verify API:", fetchError)
      return NextResponse.json(
        {
          status: false,
          message: "Failed to connect to payment verification service",
        },
        { status: 500 },
      )
    }

    console.log("Paystack verify response status:", paystackResponse.status)

    // Get Paystack response text
    let paystackResponseText
    try {
      paystackResponseText = await paystackResponse.text()
      console.log("Paystack verify response text:", paystackResponseText)
    } catch (textError) {
      console.error("Failed to read Paystack verify response:", textError)
      return NextResponse.json(
        {
          status: false,
          message: "Failed to read payment verification response",
        },
        { status: 500 },
      )
    }

    if (!paystackResponse.ok) {
      console.error("Paystack verification error:", paystackResponseText)

      let errorMessage = `Payment verification error: ${paystackResponse.status}`
      try {
        const errorJson = JSON.parse(paystackResponseText)
        errorMessage = errorJson.message || errorMessage
      } catch (parseError) {
        // Keep default error message
      }

      return NextResponse.json(
        {
          status: false,
          message: errorMessage,
        },
        { status: 500 },
      )
    }

    // Parse successful response
    let result
    try {
      result = JSON.parse(paystackResponseText)
      console.log("Paystack verify success response:", result)
    } catch (parseError) {
      console.error("Failed to parse Paystack verify success response:", parseError)
      return NextResponse.json(
        {
          status: false,
          message: "Invalid response from payment verification service",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("=== Paystack Verify Route Error ===", error)
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
