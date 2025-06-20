"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Truck, Check, Smartphone } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useEmailNotifications } from "@/hooks/use-email-notifications"
import Image from "next/image"

type CheckoutStep = "shipping" | "payment" | "confirmation"
type PaymentMethod = "card" | "momo"

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    region: "",
    zipCode: "",
    country: "Ghana",
    phone: "",
  })
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  })
  const [momoInfo, setMomoInfo] = useState({
    provider: "mtn",
    phoneNumber: "",
    accountName: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState("")

  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { sendOrderConfirmation } = useEmailNotifications()
  const router = useRouter()

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("payment")
    window.scrollTo(0, 0)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }

    // Simulate payment processing
    setTimeout(async () => {
      setIsProcessing(false)
      const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
      const trackingNumber = `TRK-${Math.floor(100000 + Math.random() * 900000)}`
      setOrderId(newOrderId)

      // Save order to localStorage for order history
      const order = {
        id: newOrderId,
        trackingNumber,
        date: new Date().toISOString(),
        items: cartItems,
        total: totalAmount,
        status: "Processing",
        shippingInfo,
        paymentMethod: paymentMethod === "momo" ? `Mobile Money (${momoInfo.provider.toUpperCase()})` : "Credit Card",
        statusHistory: [
          {
            status: "Order Placed",
            date: new Date().toISOString(),
            description: "Your order has been received and is being processed",
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

      setCurrentStep("confirmation")
      clearCart()
      window.scrollTo(0, 0)
    }, 2000)
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
                      paymentMethod === "card" ? "border-rose-500 bg-rose-50" : "border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard className="h-8 w-8 mb-2" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </button>
                  <button
                    type="button"
                    className={`p-4 border-2 rounded-lg flex flex-col items-center ${
                      paymentMethod === "momo" ? "border-rose-500 bg-rose-50" : "border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("momo")}
                  >
                    <Smartphone className="h-8 w-8 mb-2" />
                    <span className="font-medium">Mobile Money</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {paymentMethod === "card" ? (
                  <>
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="cardNumber"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                        value={paymentInfo.cardName}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                          placeholder="MM/YY"
                          value={paymentInfo.expiry}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                          placeholder="123"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </>
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
                        <strong>Note:</strong> You will receive a prompt on your phone to authorize the payment of ₵
                        {totalAmount.toFixed(2)}.
                      </p>
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-gradient-to-r from-rose-400 to-purple-500 text-white rounded-lg font-medium hover:from-rose-500 hover:to-purple-600 transition-colors disabled:opacity-70"
                  >
                    {isProcessing ? "Processing..." : `Pay ₵${totalAmount.toFixed(2)}`}
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
              <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-gray-600 mb-2">Your order #{orderId} has been placed successfully.</p>
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
