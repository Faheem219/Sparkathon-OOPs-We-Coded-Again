import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const CartPage = () => {
    const [products, setProducts] = useState({})
    const [loading, setLoading] = useState(true)
    const [updatingItems, setUpdatingItems] = useState({})
    const [orderLoading, setOrderLoading] = useState(false)

    const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user && Object.keys(cart.items).length > 0) {
            fetchCartProducts()
        } else {
            setLoading(false)
        }
    }, [cart.items, user])

    const fetchCartProducts = async () => {
        try {
            setLoading(true)
            const productPromises = Object.keys(cart.items).map(async (productId) => {
                try {
                    const response = await api.products.getById(productId)
                    return { [productId]: response.data.product }
                } catch (error) {
                    console.error(`Error fetching product ${productId}:`, error)
                    return null
                }
            })

            const productResults = await Promise.all(productPromises)
            const productsData = productResults
                .filter(result => result !== null)
                .reduce((acc, product) => ({ ...acc, ...product }), {})
            setProducts(productsData)
        } catch (error) {
            console.error('Error fetching cart products:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateSubtotal = () => {
        return Object.entries(cart.items).reduce((total, [productId, quantity]) => {
            const product = products[productId]
            if (product) {
                return total + (product.price * quantity)
            }
            return total
        }, 0)
    }

    const calculateTax = (subtotal) => {
        return subtotal * 0.08 // 8% tax
    }

    const calculateTotal = () => {
        const subtotal = calculateSubtotal()
        const tax = calculateTax(subtotal)
        return subtotal + tax
    }

    const handleQuantityUpdate = async (productId, newQuantity) => {
        setUpdatingItems(prev => ({ ...prev, [productId]: true }))
        const result = await updateQuantity(productId, newQuantity)
        if (!result.success) {
            alert(result.error)
        }
        setUpdatingItems(prev => ({ ...prev, [productId]: false }))
    }

    const handleRemoveItem = async (productId) => {
        setUpdatingItems(prev => ({ ...prev, [productId]: true }))
        const result = await removeFromCart(productId)
        if (!result.success) {
            alert(result.error)
        }
        setUpdatingItems(prev => ({ ...prev, [productId]: false }))
    }

    const handlePlaceOrder = async () => {
        if (!user) {
            alert('Please login to place an order')
            return
        }

        if (Object.keys(cart.items).length === 0) {
            alert('Your cart is empty')
            return
        }

        try {
            setOrderLoading(true)

            // Create order with shipping address
            const orderData = {
                shipping_address: {
                    street: "123 Main St", // In a real app, get this from a form
                    city: "Anytown",
                    state: "CA",
                    zip_code: "12345",
                    country: "USA"
                },
                payment_method: "card"
            }

            const result = await api.cart.placeOrder(orderData)

            if (result.data) {
                // Clear the cart state since order was successful
                await clearCart()
                
                // Navigate to purchase history with success message
                navigate('/history', {
                    state: {
                        message: result.data.message,
                        orderId: result.data.order_id,
                        totalAmount: result.data.total_amount
                    }
                })
            } else {
                throw new Error('Failed to place order')
            }
        } catch (error) {
            console.error('Error placing order:', error)
            const errorMessage = error.response?.data?.detail || 'Failed to place order. Please try again.'
            alert(errorMessage)
        } finally {
            setOrderLoading(false)
        }
    }

    if (!user) {
        return (
            <div>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
                        <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
                        <Link
                            to="/login"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Login to Continue
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your cart...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const cartItems = Object.entries(cart.items)

    if (cartItems.length === 0) {
        return (
            <div>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                        <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
                        <Link
                            to="/home"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    const total = calculateTotal()

    return (
        <div>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map(([productId, quantity]) => {
                            const product = products[productId]
                            const isUpdating = updatingItems[productId]

                            if (!product) return null

                            return (
                                <div key={productId} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center space-x-4">
                                        {/* Product Image */}
                                        <Link to={`/item/${productId}`}>
                                            <img
                                                src={product.image_url || '/placeholder-image.jpg'}
                                                alt={product.name}
                                                className="w-20 h-20 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg'
                                                }}
                                            />
                                        </Link>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <Link
                                                to={`/item/${productId}`}
                                                className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors"
                                            >
                                                {product.name}
                                            </Link>
                                            {product.brand && (
                                                <p className="text-gray-600">{product.brand}</p>
                                            )}
                                            <p className="text-blue-600 font-bold text-lg mt-1">
                                                ${product.price.toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleQuantityUpdate(productId, quantity - 1)}
                                                disabled={isUpdating || quantity <= 1}
                                                className="bg-gray-200 hover:bg-gray-300 p-1 rounded disabled:opacity-50"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="font-medium min-w-[2rem] text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityUpdate(productId, quantity + 1)}
                                                disabled={isUpdating}
                                                className="bg-gray-200 hover:bg-gray-300 p-1 rounded disabled:opacity-50"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveItem(productId)}
                                            disabled={isUpdating}
                                            className="text-red-600 hover:text-red-800 p-2 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Item Total */}
                                    <div className="text-right mt-4 pt-4 border-t">
                                        <span className="text-lg font-medium text-gray-800">
                                            Item Total: ${(product.price * quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-blue-600">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={orderLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-colors disabled:opacity-50"
                            >
                                {orderLoading ? 'Placing Order...' : 'Place Order'}
                            </button>

                            <Link
                                to="/home"
                                className="block text-center text-blue-600 hover:text-blue-800 font-medium mt-4"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage
