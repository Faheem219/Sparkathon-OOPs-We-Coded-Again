import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import api from '../services/api'

const CartContext = createContext()

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: {} })
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            fetchCart()
        } else {
            setCart({ items: {} })
        }
    }, [user])

    const fetchCart = async () => {
        if (!user) return

        try {
            setLoading(true)
            console.log('Fetching cart for user:', user.id)
            const response = await api.cart.get()
            console.log('Cart fetch response:', response.data)
            setCart(response.data || { items: {} })
        } catch (error) {
            console.error('Error fetching cart:', error.response?.data || error.message)
            setCart({ items: {} })
        } finally {
            setLoading(false)
        }
    }

    const addToCart = async (productId, quantity = 1) => {
        if (!user) return { success: false, error: 'Please login first' }

        try {
            console.log('Adding to cart:', { productId, quantity, user: user.id })
            const response = await api.cart.add({
                product_id: productId,
                quantity
            })
            console.log('Add to cart response:', response.data)
            await fetchCart() // Refresh cart after adding
            return { success: true }
        } catch (error) {
            console.error('Add to cart error:', error.response?.data || error.message)
            return {
                success: false,
                error: error.response?.data?.detail || error.message || 'Failed to add to cart'
            }
        }
    }

    const updateQuantity = async (productId, quantity) => {
        if (!user) return { success: false, error: 'Please login first' }

        try {
            if (quantity <= 0) {
                return removeFromCart(productId)
            }

            await api.cart.update({
                product_id: productId,
                quantity
            })

            await fetchCart() // Refresh cart after updating
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to update cart'
            }
        }
    }

    const removeFromCart = async (productId) => {
        if (!user) return { success: false, error: 'Please login first' }

        try {
            await api.cart.remove(productId)
            await fetchCart() // Refresh cart after removing
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to remove from cart'
            }
        }
    }

    const clearCart = async () => {
        if (!user) return { success: false, error: 'Please login first' }

        try {
            await api.cart.clear()
            setCart({ items: {} })
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to clear cart'
            }
        }
    }

    const getCartItemCount = () => {
        return Object.values(cart.items).reduce((total, quantity) => total + quantity, 0)
    }

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartItemCount,
        fetchCart
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}
