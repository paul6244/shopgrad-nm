"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Truck, Check, Smartphone, AlertCircle, Info } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useEmailNotifications } from "@/hooks/use-email-notifications"
import { usePaystack } from "@/hooks/use-paystack"
import Image from "next/image"

type CheckoutStep = "shipping" | "payment" | "confirmation"
type PaymentMethod = "paystack" | "momo"

export default function CheckoutPage() {
  // Check if Paystack is properly configured
  const isPaystackConfigured =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY &&
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY !== "pk_test_default" &&
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.startsWith("pk_")

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack")
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    region: "",
    zipCode: "",
    country: "Ghana",
    phone: "",
  })
  const [momoInfo, setMomoInfo] = useState({
    provider: "mtn",
    phoneNumber: "",
    accountName: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { sendOrderConfirmation } = useEmailNotifications()
  const router = useRouter()

  const { initializePayment, verifyPayment, isLoading: paystackLoading } = usePaystack()

  const handlePaymentSuccess = async (paymentReference: string) => {
    const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
    const trackingNumber = `TRK-${Math.floor(100000 + Math.random() * 900000)}`
    setOrderId(newOrderId)

    // Save order to localStorage for order history
    const order = {
      id: newOrderId,
      trackingNumber,
      paymentReference,
      date: new Date().toISOString(),
      items: cartItems,
      total: totalAmount,
      status: "Processing",
      shippingInfo,
      paymentMethod: paymentMethod === "momo" ? `Mobile Money (${momoInfo.provider.toUpperCase()})` : "Paystack",
      statusHistory: [
        {
          status: "Order Placed",
          date: new Date().toISOString(),
          description: "Your order has been received and payment confirmed",
        },
      ],
    }

    const existingOrders = JSON.parse(localStorage.getItem(`orders-${user?.id}`) || "[]")
    existingOrders.unshift(order)
    localStorage.setItem(`orders-${user?.id}`, JSON.stringify(existingOrders))

    // Send order confirmation email
    try {
      await sendOrderConfirmation({
        id: newOrderId,
        customerEmail: user?.email,
        total: totalAmount,
        items: cartItems,
      })
    } catch (error) {
      console.error("Failed to send confirmation email:", error)
    }

    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Order Confirmed!", {
        body: `Your order #${newOrderId} has been placed successfully.`,
        icon: "/placeholder-logo.png",
      })
    }

    setCurrentStep("confirmation")
    clearCart()
    setIsProcessing(false)
    setPaymentError(null)
    setDebugInfo(null)
    window.scrollTo(0, 0)
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("payment")
    window.scrollTo(0, 0)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setPaymentError(null)
    setDebugInfo(null)

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }

    try {
      if (paymentMethod === "paystack") {
        // Generate a customer email if user doesn't have one
        const customerEmail = user?.email || `${shippingInfo.fullName.toLowerCase().replace(/\s+/g, "")}@shopgrad.com`

        console.log("Starting Paystack payment for:", {
          email: customerEmail,
          amount: totalAmount,
          customerName: shippingInfo.fullName,
        })

        await initializePayment({
          email: customerEmail,
          amount: totalAmount,
          metadata: {
            orderId: `ORD-${Date.now()}`,
            customerName: shippingInfo.fullName,
            customerPhone: shippingInfo.phone,
            items: cartItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          },
          onSuccess: async (reference) => {
            console.log("Payment success callback triggered:", reference)
            try {
              // Verify payment
              const verification = await verifyPayment(reference)
              console.log("Payment verification result:", verification)

              if (verification.status && verification.data?.status === "success") {
                await handlePaymentSuccess(reference)
              } else {
                setPaymentError("Payment verification failed. Please contact support.")
                setIsProcessing(false)
              }
            } catch (error) {
              console.error("Payment verification error:", error)
              setPaymentError("Payment verification failed. Please contact support.")
              setIsProcessing(false)
            }
          },
          onError: (error) => {
            console.error("Payment error:", error)
            setPaymentError(`Payment failed: ${error}`)
            setIsProcessing(false)
          },
          onClose: () => {
            console.log("Payment popup closed")
            setIsProcessing(false)
          },
        })
      } else {
        // Simulate mobile money payment
        setTimeout(async () => {
          await handlePaymentSuccess(`MOMO-${Date.now()}`)
        }, 2000)
      }
    } catch (error) {
      console.error("Payment submission error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to process payment. Please try again."
      setPaymentError(errorMessage)

      // Extract debug info if available
      if (error instanceof Error && error.message.includes("HTTP")) {
        setDebugInfo({
          error: error.message,
          timestamp: new Date().toISOString(),
          paymentMethod,
          amount: totalAmount,
        })
      }

      setIsProcessing(false)
    }
  }

  const shippingCost = 71.88 // ~$5.99 * 12
  const tax = cartTotal * 0.125 // Ghana VAT is 12.5%
  const totalAmount = cartTotal + shippingCost + tax

  if (cartItems.length === 0 && currentStep !== "confirmation") {
    router.push("/")
    return null
  }

  const ghanaRegions = [
    "Greater Accra",
    "Ashanti",
    "Western",
    "Central",
    "Eastern",
    "Volta",
    "Northern",
    "Upper East",
    "Upper West",
    "Brong-Ahafo",
    "Western North",
    "Ahafo",
    "Bono",
    "Bono East",
    "Oti",
    "Savannah",
    "North East",
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-rose-200 via-rose-300 to-purple-500">
      {/* Header */}
      <div className="px-6 py-4">
        {currentStep !== "confirmation" ? (
          <Link href="/" className="inline-flex items-center text-black">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Shop
          </Link>
        ) : (
          <div className="h-6"></div>
        )}
      </div>

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Error Display */}
        {paymentError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                <p className="text-sm text-red-700 mt-1">{paymentError}</p>

                {debugInfo && (
                  <details className="mt-3">
                    <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                      Show Debug Information
                    </summary>
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
                      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                  </details>
                )}

                <div className="mt-3 text-xs text-red-600">
                  <p>If this error persists:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check your internet connection</li>
                    <li>Verify your payment details</li>
                    <li>Try refreshing the page</li>
                    <li>Contact support if the issue continues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Warning */}
        {!isPaystackConfigured && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Paystack Configuration Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="mb-2">To process real payments, you need to configure your Paystack API keys:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>
                      Get your API keys from{" "}
                      <a
                        href="https://dashboard.paystack.com/#/settings/developer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Paystack Dashboard
                      </a>
                    </li>
                    <li>
                      Add them to your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file:
                    </li>
                  </ol>
                  <div className="mt-2 bg-yellow-100 p-2 rounded text-xs font-mono">
                    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
                    <br />
                    PAYSTACK_SECRET_KEY=sk_live_your_key_here
                  </div>
                  <p className="mt-2">For now, you can test with the "Direct Mobile Money" option.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Steps */}
        {currentStep !== "confirmation" && (
          <div className="flex justify-between mb-8 px-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "shipping" ? "bg-rose-500 text-white" : "bg-white text-rose-500"
                }`}
              >
                1
              </div>
              <span className="text-xs mt-1 text-white">Shipping</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="h-1 w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "payment" ? "bg-rose-500 text-white" : "bg-white text-gray-400"
                }`}
              >
                2
              </div>
              <span className="text-xs mt-1 text-white">Payment</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="h-1 w-full bg-white bg-opacity-30"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-gray-400">3</div>
              <span className="text-xs mt-1 text-white">Confirmation</span>
            </div>
          </div>
        )}

        {/* Shipping Step */}
        {currentStep === "shipping" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">Shipping Information</h1>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={shippingInfo.fullName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <select
                      id="region"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      value={shippingInfo.region}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, region: e.target.value })}
                      required
                    >
                      <option value="">Select Region</option>
                      {ghanaRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      id="country"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      required
                    >
                      <option value="Ghana">Ghana</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Togo">Togo</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                    placeholder="+233 XX XXX XXXX"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-rose-400 to-purple-500 text-white rounded-lg font-medium hover:from-rose-500 hover:to-purple-600 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Step */}
        {currentStep === "payment" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">Payment Information</h1>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Choose Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`p-4 border-2 rounded-lg flex flex-col items-center ${
                      paymentMethod === "paystack" ? "border-rose-500 bg-rose-50" : "border-gray-300"
                    } ${!isPaystackConfigured ? "opacity-50" : ""}`}
                    onClick={() => setPaymentMethod("paystack")}
                    disabled={!isPaystackConfigured}
                  >
                    <CreditCard className="h-8 w-8 mb-2" />
                    <span className="font-medium">Paystack</span>
                    <span className="text-xs text-gray-500 mt-1">Card, Bank, Mobile Money</span>
                    {!isPaystackConfigured && <span className="text-xs text-red-500 mt-1">Requires Configuration</span>}
                  </button>
                  <button
                    type="button"
                    className={`p-4 border-2 rounded-lg flex flex-col items-center ${
                      paymentMethod === "momo" ? "border-rose-500 bg-rose-50" : "border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("momo")}
                  >
                    <Smartphone className="h-8 w-8 mb-2" />
                    <span className="font-medium">Direct Mobile Money</span>
                    <span className="text-xs text-gray-500 mt-1">MTN, Vodafone, AirtelTigo</span>
                    <span className="text-xs text-green-600 mt-1">Available for Testing</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {paymentMethod === "paystack" ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Paystack Payment</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      You will be redirected to Paystack's secure payment page where you can pay with:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Credit/Debit Cards (Visa, Mastercard)</li>
                      <li>• Bank Transfer</li>
                      <li>• Mobile Money (MTN, Vodafone, AirtelTigo)</li>
                      <li>• USSD Banking</li>
                      <li>• QR Code</li>
                    </ul>
                    <div className="mt-3 p-3 bg-green-100 rounded border-l-4 border-green-500">
                      <p className="text-sm text-green-800">
                        <strong>Live Mode:</strong> Real payments will be processed. Your customers will be charged
                        actual money.
                      </p>
                    </div>
                    <div className="mt-3 p-3 bg-blue-100 rounded">
                      <p className="text-sm text-blue-700">
                        <strong>Secure Payments:</strong> All transactions are processed securely through Paystack's
                        encrypted payment gateway.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="momoProvider" className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Money Provider
                      </label>
                      <select
                        id="momoProvider"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                        value={momoInfo.provider}
                        onChange={(e) => setMomoInfo({ ...momoInfo, provider: e.target.value })}
                        required
                      >
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="vodafone">Vodafone Cash</option>
                        <option value="airteltigo">AirtelTigo Money</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="momoPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Money Number
                      </label>
                      <input
                        type="tel"
                        id="momoPhone"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                        placeholder="+233 XX XXX XXXX"
                        value={momoInfo.phoneNumber}
                        onChange={(e) => setMomoInfo({ ...momoInfo, phoneNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="momoName" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        id="momoName"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                        placeholder="Name as registered on mobile money account"
                        value={momoInfo.accountName}
                        onChange={(e) => setMomoInfo({ ...momoInfo, accountName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Demo Mode:</strong> This will simulate a mobile money payment of ₵
                        {totalAmount.toFixed(2)} for testing purposes.
                      </p>
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={
                      isProcessing || paystackLoading || (paymentMethod === "paystack" && !isPaystackConfigured)
                    }
                    className="w-full py-3 bg-gradient-to-r from-rose-400 to-purple-500 text-white rounded-lg font-medium hover:from-rose-500 hover:to-purple-600 transition-colors disabled:opacity-70"
                  >
                    {isProcessing || paystackLoading ? "Processing..." : `Pay ₵${totalAmount.toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {currentStep === "confirmation" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-2">Your order #{orderId} has been confirmed and paid.</p>
              <p className="text-sm text-gray-500 mb-6">📧 A confirmation email has been sent to {user?.email}</p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Truck className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Estimated delivery: 3-5 business days</span>
                </div>
                <p className="text-sm text-gray-500">
                  Shipping to: {shippingInfo.fullName}, {shippingInfo.address}, {shippingInfo.city},{" "}
                  {shippingInfo.region}
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Link
                  href="/profile/orders"
                  className="inline-block py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Track Order
                </Link>
                <Link
                  href="/"
                  className="inline-block py-3 px-6 bg-gradient-to-r from-rose-400 to-purple-500 text-white rounded-lg font-medium hover:from-rose-500 hover:to-purple-600 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        {currentStep !== "confirmation" && (
          <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="w-16 h-16 rounded-md overflow-hidden relative flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized={item.image.startsWith("http")}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium">₵{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal</span>
                  <span>₵{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Shipping</span>
                  <span>₵{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span>VAT (12.5%)</span>
                  <span>₵{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₵{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
