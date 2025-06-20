"use client"

import { createContext, useContext, type ReactNode } from "react"

interface EmailNotificationContextType {
  sendOrderConfirmation: (orderData: any) => Promise<void>
  sendOrderStatusUpdate: (orderData: any) => Promise<void>
  sendShippingNotification: (orderData: any) => Promise<void>
  sendDeliveryNotification: (orderData: any) => Promise<void>
}

const EmailNotificationContext = createContext<EmailNotificationContextType | undefined>(undefined)

export function EmailNotificationProvider({ children }: { children: ReactNode }) {
  // Simulate email sending (in a real app, this would call your email service)
  const simulateEmailSend = async (emailType: string, data: any) => {
    console.log(`📧 Sending ${emailType} email:`, data)

    // Show browser notification to simulate email
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`ShopGrad - ${emailType}`, {
        body: `Email sent for order #${data.orderId}`,
        icon: "/favicon.ico",
      })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const sendOrderConfirmation = async (orderData: any) => {
    await simulateEmailSend("Order Confirmation", {
      orderId: orderData.id,
      customerEmail: orderData.customerEmail,
      total: orderData.total,
      items: orderData.items,
    })
  }

  const sendOrderStatusUpdate = async (orderData: any) => {
    await simulateEmailSend("Order Status Update", {
      orderId: orderData.id,
      status: orderData.status,
      customerEmail: orderData.customerEmail,
    })
  }

  const sendShippingNotification = async (orderData: any) => {
    await simulateEmailSend("Shipping Notification", {
      orderId: orderData.id,
      trackingNumber: orderData.trackingNumber,
      customerEmail: orderData.customerEmail,
    })
  }

  const sendDeliveryNotification = async (orderData: any) => {
    await simulateEmailSend("Delivery Notification", {
      orderId: orderData.id,
      customerEmail: orderData.customerEmail,
    })
  }

  return (
    <EmailNotificationContext.Provider
      value={{
        sendOrderConfirmation,
        sendOrderStatusUpdate,
        sendShippingNotification,
        sendDeliveryNotification,
      }}
    >
      {children}
    </EmailNotificationContext.Provider>
  )
}

export function useEmailNotifications() {
  const context = useContext(EmailNotificationContext)
  if (context === undefined) {
    throw new Error("useEmailNotifications must be used within an EmailNotificationProvider")
  }
  return context
}
