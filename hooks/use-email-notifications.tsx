"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "sonner"

interface EmailNotification {
  to: string
  subject: string
  message: string
  type: "order_confirmation" | "status_update" | "shipping" | "delivery"
}

interface EmailNotificationContextType {
  sendEmail: (notification: EmailNotification) => Promise<boolean>
  isLoading: boolean
}

const EmailNotificationContext = createContext<EmailNotificationContextType | undefined>(undefined)

export function EmailNotificationProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const sendEmail = async (notification: EmailNotification): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate email sending (replace with actual email service)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show browser notification as demo
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`ShopGrad: ${notification.subject}`, {
          body: notification.message,
          icon: "/placeholder-logo.png",
        })
      }

      // Show toast notification
      toast.success(`Email sent: ${notification.subject}`)

      console.log("Email sent:", notification)
      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      toast.error("Failed to send email notification")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <EmailNotificationContext.Provider value={{ sendEmail, isLoading }}>{children}</EmailNotificationContext.Provider>
  )
}

export function useEmailNotifications() {
  const context = useContext(EmailNotificationContext)
  if (context === undefined) {
    throw new Error("useEmailNotifications must be used within an EmailNotificationProvider")
  }
  return context
}
