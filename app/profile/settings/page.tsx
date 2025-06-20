"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, User, Bell, Shield, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [userSettings, setUserSettings] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    notifications: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
    },
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Load user settings from localStorage
    const storedSettings = localStorage.getItem(`settings-${user.id}`)
    if (storedSettings) {
      setUserSettings(JSON.parse(storedSettings))
    } else {
      // Initialize with user data
      setUserSettings((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }))
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem(`settings-${user.id}`, JSON.stringify(userSettings))
      setIsSaving(false)
      setIsEditing(false)
    }, 1000)
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Clear all user data
      localStorage.removeItem(`settings-${user.id}`)
      localStorage.removeItem(`orders-${user.id}`)
      localStorage.removeItem(`favorites-${user.id}`)
      logout()
      router.push("/")
    }
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
      <div className="px-6 py-4">
        <Link href="/profile" className="inline-flex items-center text-black">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Profile
        </Link>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      value={userSettings.name}
                      onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 text-gray-900">{userSettings.name || "Not set"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      value={userSettings.email}
                      onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 text-gray-900">{userSettings.email || "Not set"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      placeholder="+233 XX XXX XXXX"
                      value={userSettings.phone}
                      onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 text-gray-900">{userSettings.phone || "Not set"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  {isEditing ? (
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      value={userSettings.region}
                      onChange={(e) => setUserSettings({ ...userSettings, region: e.target.value })}
                    >
                      <option value="">Select Region</option>
                      {ghanaRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="py-2 text-gray-900">{userSettings.region || "Not set"}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      rows={3}
                      value={userSettings.address}
                      onChange={(e) => setUserSettings({ ...userSettings, address: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 text-gray-900">{userSettings.address || "Not set"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                      value={userSettings.city}
                      onChange={(e) => setUserSettings({ ...userSettings, city: e.target.value })}
                    />
                  ) : (
                    <p className="py-2 text-gray-900">{userSettings.city || "Not set"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Order Updates</h3>
                    <p className="text-sm text-gray-500">Get notified about your order status</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={userSettings.notifications.orderUpdates}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          notifications: {
                            ...userSettings.notifications,
                            orderUpdates: e.target.checked,
                          },
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Promotions & Deals</h3>
                    <p className="text-sm text-gray-500">Receive notifications about special offers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={userSettings.notifications.promotions}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          notifications: {
                            ...userSettings.notifications,
                            promotions: e.target.checked,
                          },
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Newsletter</h3>
                    <p className="text-sm text-gray-500">Weekly newsletter with new products and tips</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={userSettings.notifications.newsletter}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          notifications: {
                            ...userSettings.notifications,
                            newsletter: e.target.checked,
                          },
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Actions
              </h2>

              <div className="space-y-4">
                <button
                  onClick={logout}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium">Sign Out</h3>
                  <p className="text-sm text-gray-500">Sign out of your account</p>
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                >
                  <div className="flex items-center">
                    <Trash2 className="h-5 w-5 mr-2" />
                    <div>
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-red-500">Permanently delete your account and all data</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
