"use client"

import { X, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import Image from "next/image"
import Link from "next/link"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-6 bg-gradient-to-r from-rose-200 to-rose-300 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Your Cart ({cartItems.length})
                </h2>
                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 py-6 px-4 sm:px-6 overflow-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-400 hover:bg-rose-500"
                      onClick={onClose}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-4 flex">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized={item.image.startsWith("http")}
                        />
                      </div>
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3 className="line-clamp-1">{item.name}</h3>
                            <p className="ml-4">₵{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <div className="flex items-center border rounded-md">
                            <button
                              className="px-2 py-1 text-gray-600"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              -
                            </button>
                            <span className="px-2 py-1">{item.quantity}</span>
                            <button
                              className="px-2 py-1 text-gray-600"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="text-rose-500 hover:text-rose-600"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Subtotal</p>
                  <p>₵{cartTotal.toFixed(2)}</p>
                </div>
                <Link
                  href="/checkout"
                  className="w-full bg-gradient-to-r from-rose-400 to-purple-500 text-white py-3 px-4 rounded-full font-medium hover:from-rose-500 hover:to-purple-600 transition-colors flex items-center justify-center"
                  onClick={onClose}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Checkout
                </Link>
                <div className="mt-4 flex justify-center text-sm text-gray-500">
                  <button type="button" className="text-rose-400 hover:text-rose-500" onClick={onClose}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
