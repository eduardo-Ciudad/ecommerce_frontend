import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import { cartService } from '../services/cartService'
import { AuthContext } from './AuthContext'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useContext(AuthContext)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const data = await cartService.getCart()
      setCart(data)
    } catch {
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [isAuthenticated, fetchCart])

  const addToCart = useCallback(async (variantId, quantity) => {
    const updated = await cartService.addItem(variantId, quantity)
    setCart(updated)
    return updated
  }, [])

  const removeFromCart = useCallback(async (itemId) => {
    await cartService.removeItem(itemId)
    setCart((prev) => {
      if (!prev) return prev
      return { ...prev, items: prev.items.filter((i) => i.id !== itemId) }
    })
  }, [])

  const updateQuantity = useCallback(async (itemId, variantId, quantity) => {
    const updated = await cartService.updateItem(itemId, variantId, quantity)
    setCart(updated)
    return updated
  }, [])

  const clearCart = useCallback(() => {
    setCart(null)
  }, [])

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, itemCount, isLoading, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}
