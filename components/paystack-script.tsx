"use client"

import { useEffect } from "react"

export function PaystackScript() {
  useEffect(() => {
    // Load Paystack inline script
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  return null
}
