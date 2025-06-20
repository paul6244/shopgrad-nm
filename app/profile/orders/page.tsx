"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Package, Eye, Truck, MapPin, Clock, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useEmailNotifications } from "@/hooks/use-email-notifications"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface OrderItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

interface StatusHistoryItem {
  status: string
  date: string
  description: string
}

interface Order {
  id: string
  trackingNumber: string
  date: string
  items: OrderItem[]
  total: number
  status: string
  shippingInfo: any
  paymentMethod: string
  statusHistory: StatusHistoryItem[]
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { sendOrderStatusUpdate, sendShippingNotification, sendDeliveryNotification } = useEmailNotifications()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Load orders from localStorage
    const storedOrders = localStorage.getItem(`orders-${user.id}`)
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }

    // Simulate order status updates
    const interval = setInterval(() => {
      updateOrderStatuses()
    }, 30000) // Update every 30 seconds for demo

    return () => clearInterval(interval)
  }, [user, router])

  const updateOrderStatuses = () => {
    const storedOrders = localStorage.getItem(`orders-${user?.id}`)
    if (!storedOrders) return

    const currentOrders = JSON.parse(storedOrders)
    let hasUpdates = false

    const updatedOrders = currentOrders.map((order: Order) => {
      const orderAge = Date.now() - new Date(order.date).getTime()
      const hoursOld = orderAge / (1000 * 60 * 60)

      let newStatus = order.status
      const newStatusHistory = [...order.statusHistory]

      // Simulate status progression
      if (hoursOld > 0.1 && order.status === "Processing") {
        // 6 minutes for demo
        newStatus = "Confirmed"
        newStatusHistory.push({
          status: "Order Confirmed",
          date: new Date().toISOString(),
          description: "Your order has been confirmed and is being prepared",
        })
        hasUpdates = true
      } else if (hoursOld > 0.2 && order.status === "Confirmed") {
        // 12 minutes for demo
        newStatus = "Shipped"
        newStatusHistory.push({
          status: "Order Shipped",
          date: new Date().toISOString(),
          description: `Your order has been shipped with tracking number ${order.trackingNumber}`,
        })
        hasUpdates = true

        // Send shipping notification
        sendShippingNotification({
          id: order.id,
          trackingNumber: order.trackingNumber,
          customerEmail: user?.email,
        })
      } else if (hoursOld > 0.3 && order.status === "Shipped") {
        // 18 minutes for demo
        newStatus = "Out for Delivery"
        newStatusHistory.push({
          status: "Out for Delivery",
          date: new Date().toISOString(),
          description: "Your order is out for delivery and will arrive soon",
        })
        hasUpdates = true
      } else if (hoursOld > 0.4 && order.status === "Out for Delivery") {
        // 24 minutes for demo
        newStatus = "Delivered"
        newStatusHistory.push({
          status: "Delivered",
          date: new Date().toISOString(),
          description: "Your order has been delivered successfully",
        })
        hasUpdates = true

        // Send delivery notification
        sendDeliveryNotification({
          id: order.id,
          customerEmail: user?.email,
        })
      }

      if (newStatus !== order.status) {
        // Send status update email
        sendOrderStatusUpdate({
          id: order.id,
          status: newStatus,
          customerEmail: user?.email,
        })
      }

      return {
        ...order,
        status: newStatus,
        statusHistory: newStatusHistory,
      }
    })

    if (hasUpdates) {
      localStorage.setItem(`orders-${user?.id}`, JSON.stringify(updatedOrders))
      setOrders(updatedOrders)
    }
  }

  if (!user) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "out for delivery":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "out for delivery":
        return <MapPin className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-rose-200 via-rose-300 to-purple-500">
      <div className="px-6 py-4">
        <Link href="/profile" className="inline-flex items-center text-black">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Profile
        </Link>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Payment: {order.paymentMethod}</p>
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-500">Tracking: {order.trackingNumber}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                      <p className="text-lg font-bold mt-2">₵{order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div
                              key={index}
                              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white relative"
                            >
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                unoptimized={item.image.startsWith("http")}
                              />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="flex items-center px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {selectedOrder?.id === order.id ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className="border-t mt-4 pt-4">
                      {/* Order Tracking */}
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Order Tracking</h4>
                        <div className="space-y-3">
                          {order.statusHistory.map((status, index) => (
                            <div key={index} className="flex items-start">
                              <div
                                className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                                  index === 0 ? "bg-rose-500" : "bg-gray-300"
                                }`}
                              ></div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="text-sm font-medium">{status.status}</h5>
                                    <p className="text-xs text-gray-500">{status.description}</p>
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {new Date(status.date).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <h4 className="font-medium mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center">
                            <div className="w-12 h-12 rounded-md overflow-hidden relative flex-shrink-0">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                unoptimized={item.image.startsWith("http")}
                              />
                            </div>
                            <div className="ml-3 flex-1">
                              <h5 className="text-sm font-medium">{item.name}</h5>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-medium">₵{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <p className="text-sm text-gray-600">
                          {order.shippingInfo.fullName}
                          <br />
                          {order.shippingInfo.address}
                          <br />
                          {order.shippingInfo.city}, {order.shippingInfo.region}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
