import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronUp, Calendar, Package, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const PurchaseHistoryPage = () => {
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedPurchase, setExpandedPurchase] = useState(null)
    const [products, setProducts] = useState({})

    const { user } = useAuth()
    const location = useLocation()

    useEffect(() => {
        if (user) {
            fetchPurchaseHistory()
        }
    }, [user])

    useEffect(() => {
        // Show success message if redirected from cart
        if (location.state?.message) {
            alert(location.state.message)
            // Clear the state
            window.history.replaceState({}, document.title)
        }
    }, [location])

    const fetchPurchaseHistory = async () => {
        try {
            setLoading(true)
            const response = await api.purchases.getOrderHistory()
            setPurchases(response.data.orders || [])

            // Fetch product details for all items in purchases
            const allProductIds = new Set()
            response.data.orders.forEach(order => {
                order.items.forEach(item => {
                    allProductIds.add(item.product_id)
                })
            })

            await fetchProductDetails([...allProductIds])
        } catch (error) {
            console.error('Error fetching purchase history:', error)
            setPurchases([])
        } finally {
            setLoading(false)
        }
    }

    const fetchProductDetails = async (productIds) => {
        try {
            const productPromises = productIds.map(async (productId) => {
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
            console.error('Error fetching product details:', error)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    const togglePurchaseDetails = (purchaseId) => {
        setExpandedPurchase(expandedPurchase === purchaseId ? null : purchaseId)
    }

    if (!user) {
        return (
            <div>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
                        <p className="text-gray-600 mb-6">You need to be logged in to view your purchase history.</p>
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
                            <p className="text-gray-600">Loading your purchase history...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (purchases.length === 0) {
        return (
            <div>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Purchase History</h2>
                        <p className="text-gray-600 mb-6">You haven't made any purchases yet.</p>
                        <Link
                            to="/home"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Purchase History</h1>

                <div className="space-y-4">
                    {purchases.map((order) => (
                        <div key={order.order_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Purchase Header */}
                            <div
                                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => togglePurchaseDetails(order.order_id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                Order #{order.order_id.slice(-8)}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(order.order_date)}</span>
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-800">
                                                ${order.total_amount?.toFixed(2) || '0.00'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                                            </p>
                                        </div>
                                        {expandedPurchase === order.order_id ? (
                                            <ChevronUp className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Details */}
                            {expandedPurchase === order.order_id && (
                                <div className="border-t bg-gray-50 p-6">
                                    <h4 className="font-medium text-gray-800 mb-4">Items Ordered</h4>
                                    <div className="space-y-4">
                                        {order.items.map((item) => {
                                            const product = products[item.product_id]

                                            return (
                                                <div key={item.product_id} className="flex items-center space-x-4 bg-white p-4 rounded-lg">
                                                    <Link to={`/item/${item.product_id}`}>
                                                        <img
                                                            src={product?.image_url || '/placeholder-image.jpg'}
                                                            alt={item.product_name || product?.name || 'Product'}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                            onError={(e) => {
                                                                e.target.src = '/placeholder-image.jpg'
                                                            }}
                                                        />
                                                    </Link>

                                                    <div className="flex-1">
                                                        <Link
                                                            to={`/item/${item.product_id}`}
                                                            className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                                                        >
                                                            {item.product_name || product?.name || 'Unknown Product'}
                                                        </Link>
                                                        {product?.brand && (
                                                            <p className="text-gray-600 text-sm">{product.brand}</p>
                                                        )}
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-gray-600">Qty: {item.quantity}</span>
                                                            <span className="font-medium text-gray-800">
                                                                ${item.total_price?.toFixed(2) || (item.unit_price * item.quantity).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="mt-6 pt-4 border-t">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">Shipping Address:</span>
                                            <span className="text-gray-800">
                                                {order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-600">Payment Method:</span>
                                            <span className="text-gray-800 capitalize">{order.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                Reorder Items
                                            </button>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-800">
                                                    Total: ${order.total_amount?.toFixed(2) || '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Continue Shopping */}
                <div className="text-center mt-8">
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

export default PurchaseHistoryPage
