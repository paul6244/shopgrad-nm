"use client"

import type React from "react"
import { createContext, useContext, useCallback } from "react"
import { toast } from "sonner"

interface EmailNotificationContextType {
  sendOrderConfirmation: (orderData: any) => Promise<void>
  sendOrderStatusUpdate: (orderData: any) => Promise<void>
  sendShippingNotification: (orderData: any) => Promise<void>
  sendDeliveryConfirmation: (orderData: any) => Promise<void>
}

const EmailNotificationContext = createContext<EmailNotificationContextType | undefined>(undefined)

export function EmailNotificationProvider({ children }: { children: React.ReactNode }) {
  const sendOrderConfirmation = useCallback(async (orderData: any) => {
    try {
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show browser notification as demo
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Order Confirmed!", {
          body: `Your order #${orderData.id} has been confirmed. Total: ₵${orderData.total}`,
          icon: "/placeholder-logo.png",
        })
      }

      toast.success("Order confirmation email sent!")
      console.log("Order confirmation email sent:", orderData)
    } catch (error) {
      console.error("Failed to send order confirmation email:", error)
      toast.error("Failed to send confirmation email")
    }
  }, [])

  const sendOrderStatusUpdate = useCallback(async (orderData: any) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Order Status Updated", {
          body: `Your order #${orderData.id} is now ${orderData.status}`,
          icon: "/placeholder-logo.png",
        })
      }

      toast.success("Order status email sent!")
      console.log("Order status update email sent:", orderData)
    } catch (error) {
      console.error("Failed to send order status email:", error)
    }
  }, [])

  const sendShippingNotification = useCallback(async (orderData: any) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Order Shipped!", {
          body: `Your order #${orderData.id} has been shipped. Tracking: ${orderData.trackingNumber}`,
          icon: "/placeholder-logo.png",
        })
      }

      toast.success("Shipping notification email sent!")
      console.log("Shipping notification email sent:", orderData)
    } catch (error) {
      console.error("Failed to send shipping notification:", error)
    }
  }, [])

  const sendDeliveryConfirmation = useCallback(async (orderData: any) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Order Delivered!", {
          body: `Your order #${orderData.id} has been delivered successfully!`,
          icon: "/placeholder-logo.png",
        })
      }

      toast.success("Delivery confirmation email sent!")
      console.log("Delivery confirmation email sent:", orderData)
    } catch (error) {
      console.error("Failed to send delivery confirmation:", error)
    }
  }, [])

  const value = {
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendShippingNotification,
    sendDeliveryConfirmation,
  }

  return <EmailNotificationContext.Provider value={value}>{children}</EmailNotificationContext.Provider>
}

export function useEmailNotifications() {
  const context = useContext(EmailNotificationContext)
  if (context === undefined) {
    throw new Error("useEmailNotifications must be used within an EmailNotificationProvider")
  }
  return context
}
