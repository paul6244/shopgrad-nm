"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./use-auth"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
}

interface FavoritesContextType {
  favorites: Product[]
  addToFavorites: (product: Product) => void
  removeFromFavorites: (productId: number) => void
  clearFavorites: () => void
  isFavorite: (productId: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const { user } = useAuth()

  // Load favorites from localStorage when component mounts or user changes
  useEffect(() => {
    if (user) {
      const storedFavorites = localStorage.getItem(`favorites-${user.id}`)
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }
    } else {
      setFavorites([])
    }
  }, [user])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`favorites-${user.id}`, JSON.stringify(favorites))
    }
  }, [favorites, user])

  const addToFavorites = (product: Product) => {
    setFavorites((prevFavorites) => {
      if (!prevFavorites.some((item) => item.id === product.id)) {
        return [...prevFavorites, product]
      }
      return prevFavorites
    })
  }

  const removeFromFavorites = (productId: number) => {
    setFavorites((prevFavorites) => prevFavorites.filter((item) => item.id !== productId))
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  const isFavorite = (productId: number) => {
    return favorites.some((item) => item.id === productId)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        clearFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
