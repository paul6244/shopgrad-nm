"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag } from "lucide-react"
import ProductCard from "@/components/product-card"
import CartDrawer from "@/components/cart-drawer"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useFavorites } from "@/hooks/use-favorites"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// Comprehensive product catalog with real Unsplash images
const products = [
  // Electronics (20 products)
  {
    id: 1,
    name: "Wireless Headphones",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 599.99,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 3,
    name: "Smartphone",
    price: 1799.99,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 5,
    name: "Wireless Earbuds",
    price: 239.99,
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 6,
    name: "Laptop",
    price: 2999.99,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 7,
    name: "Tablet",
    price: 1199.99,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 8,
    name: "Gaming Controller",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 9,
    name: "Webcam",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 10,
    name: "Keyboard",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 11,
    name: "Computer Mouse",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 12,
    name: "Phone Charger",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 13,
    name: "Power Bank",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1609592806596-4d8b5b5c5b5c?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 14,
    name: "USB Cable",
    price: 35.99,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 15,
    name: "Phone Case",
    price: 71.99,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 16,
    name: "Monitor",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 17,
    name: "Camera",
    price: 1599.99,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 18,
    name: "Drone",
    price: 799.99,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 19,
    name: "VR Headset",
    price: 999.99,
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },
  {
    id: 20,
    name: "Smart TV",
    price: 2199.99,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop&q=80",
    category: "Electronics",
  },

  // Fashion (25 products)
  {
    id: 21,
    name: "Running Shoes",
    price: 359.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 22,
    name: "Backpack",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 23,
    name: "Sunglasses",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 24,
    name: "Leather Wallet",
    price: 95.99,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 25,
    name: "T-Shirt",
    price: 71.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 26,
    name: "Jeans",
    price: 239.99,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 27,
    name: "Baseball Cap",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 28,
    name: "Sneakers",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 29,
    name: "Watch",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 30,
    name: "Dress",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 31,
    name: "Jacket",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 32,
    name: "Scarf",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 33,
    name: "Belt",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 34,
    name: "Handbag",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 35,
    name: "High Heels",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 36,
    name: "Boots",
    price: 279.99,
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 37,
    name: "Polo Shirt",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 38,
    name: "Hoodie",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 39,
    name: "Shorts",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 40,
    name: "Skirt",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 41,
    name: "Blazer",
    price: 349.99,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 42,
    name: "Tie",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 43,
    name: "Socks",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 44,
    name: "Underwear Set",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },
  {
    id: 45,
    name: "Jewelry Set",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop&q=80",
    category: "Fashion",
  },

  // Home & Living (20 products)
  {
    id: 46,
    name: "Coffee Maker",
    price: 359.99,
    image: "https://images.unsplash.com/photo-1570486916434-a2bbfc74de4d?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 47,
    name: "Desk Lamp",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1534189283006-b4999384a2eb?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 48,
    name: "Throw Blanket",
    price: 95.99,
    image: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 49,
    name: "Plant Pot",
    price: 47.99,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 50,
    name: "Pillow",
    price: 71.99,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 51,
    name: "Candle",
    price: 35.99,
    image: "https://images.unsplash.com/photo-1602874801006-e26d405c9c8e?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 52,
    name: "Picture Frame",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 53,
    name: "Kitchen Utensils Set",
    price: 143.99,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 54,
    name: "Storage Box",
    price: 83.99,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 55,
    name: "Dining Chair",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 56,
    name: "Table Lamp",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 57,
    name: "Curtains",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 58,
    name: "Rug",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 59,
    name: "Wall Clock",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 60,
    name: "Mirror",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 61,
    name: "Bookshelf",
    price: 399.99,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 62,
    name: "Vase",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 63,
    name: "Bed Sheets",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 64,
    name: "Towel Set",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },
  {
    id: 65,
    name: "Kitchen Scale",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&q=80",
    category: "Home",
  },

  // Fitness & Sports (15 products)
  {
    id: 66,
    name: "Yoga Mat",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 67,
    name: "Fitness Tracker",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 68,
    name: "Dumbbell Set",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 69,
    name: "Resistance Bands",
    price: 71.99,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 70,
    name: "Water Bottle",
    price: 47.99,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 71,
    name: "Jump Rope",
    price: 35.99,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 72,
    name: "Gym Towel",
    price: 23.99,
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 73,
    name: "Protein Shaker",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 74,
    name: "Exercise Ball",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 75,
    name: "Foam Roller",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 76,
    name: "Kettlebell",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 77,
    name: "Treadmill",
    price: 1999.99,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 78,
    name: "Bicycle",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 79,
    name: "Tennis Racket",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },
  {
    id: 80,
    name: "Basketball",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=500&fit=crop&q=80",
    category: "Fitness",
  },

  // Beauty & Personal Care (15 products)
  {
    id: 81,
    name: "Face Cream",
    price: 95.99,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 82,
    name: "Lipstick",
    price: 47.99,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 83,
    name: "Perfume",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 84,
    name: "Hair Brush",
    price: 35.99,
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 85,
    name: "Nail Polish",
    price: 23.99,
    image: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 86,
    name: "Makeup Palette",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 87,
    name: "Hair Dryer",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 88,
    name: "Skincare Set",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 89,
    name: "Shampoo",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 90,
    name: "Body Lotion",
    price: 71.99,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 91,
    name: "Sunscreen",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 92,
    name: "Face Mask",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 93,
    name: "Electric Toothbrush",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 94,
    name: "Razor Set",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },
  {
    id: 95,
    name: "Cologne",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&q=80",
    category: "Beauty",
  },

  // Books & Media (10 products)
  {
    id: 96,
    name: "Novel - Fiction",
    price: 71.99,
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
  {
    id: 97,
    name: "Cookbook",
    price: 95.99,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
  {
    id: 98,
    name: "Self-Help Book",
    price: 83.99,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
  {
    id: 99,
    name: "Children's Book",
    price: 47.99,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
  {
    id: 100,
    name: "Magazine",
    price: 23.99,
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
  {
    id: 101,
    name: "Biography",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
  {
    id: 102,
    name: "Science Textbook",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
  {
    id: 103,
    name: "Art Book",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
  {
    id: 104,
    name: "Travel Guide",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
  {
    id: 105,
    name: "Comic Book",
    price: 35.99,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop&q=80",
    category: "Books",
  },
]

export default function ShoppingApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cartItems, cartTotal } = useCart()
  const { user } = useAuth()
  const { isFavorite } = useFavorites()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  useEffect(() => {
    if (categoryParam) {
      setSearchQuery(categoryParam)
    }
  }, [categoryParam])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-rose-200 via-rose-300 to-purple-500">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              ShopGrad
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm hidden md:inline">Hi, {user.name}</span>
                  <Link
                    href="/profile"
                    className="w-8 h-8 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full flex items-center justify-center text-white"
                  >
                    {user.name.charAt(0)}
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-rose-400 to-purple-500 text-white"
                >
                  Sign In
                </Link>
              )}
              <button className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full py-3 pl-10 pr-4 bg-[#f2f2f7] text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
          {["All", "Electronics", "Fashion", "Home", "Fitness", "Beauty", "Books"].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                (category === "All" && !searchQuery) ||
                (category !== "All" && searchQuery.toLowerCase() === category.toLowerCase())
                  ? "bg-rose-500 text-white"
                  : "bg-white hover:bg-rose-100"
              }`}
              onClick={() => setSearchQuery(category === "All" ? "" : category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Products */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-white">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} featured isFavorite={isFavorite(product.id)} />
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <h2 className="text-xl font-bold mb-4 text-white">All Products ({filteredProducts.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} isFavorite={isFavorite(product.id)} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-white">No products found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 flex justify-center z-10 px-4">
            <Link
              href="/checkout"
              className="bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 px-8 rounded-full shadow-lg font-medium flex items-center"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Checkout (₵{cartTotal.toFixed(2)})
            </Link>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="sticky bottom-0 bg-white bg-opacity-90 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            {[
              { name: "Home", href: "/" },
              { name: "Categories", href: "/categories" },
              { name: "Favorites", href: "/favorites" },
              { name: "Profile", href: user ? "/profile" : "/login" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center ${item.name === "Home" ? "text-rose-500 font-medium" : ""}`}
              >
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
