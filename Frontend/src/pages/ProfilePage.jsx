import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, Calendar, ShoppingBag, History, Settings } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../services/api'

const ProfilePage = () => {
    const [userDetails, setUserDetails] = useState(null)
    const [purchaseHistory, setPurchaseHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        itemsInCart: 0
    })

    const { user } = useAuth()
    const { getCartItemCount } = useCart()

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    const fetchUserData = async () => {
        try {
            setLoading(true)
            
            // Fetch user details
            const userResponse = await api.auth.getMe()
            setUserDetails(userResponse.data)

            // Fetch purchase history
            const purchasesResponse = await api.purchases.getOrderHistory()
            const purchases = purchasesResponse.data?.orders || []
            setPurchaseHistory(purchases.slice(0, 5)) // Show only last 5 orders

            // Calculate stats
            const totalSpent = purchases.reduce((sum, order) => {
                return sum + (order.total_amount || 0)
            }, 0)
            
            setStats({
                totalOrders: purchases.length,
                totalSpent: totalSpent,
                itemsInCart: getCartItemCount()
            })

        } catch (error) {
            console.error('Error fetching user data:', error)
            console.error('Error details:', error.response?.data)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return 'N/A'
        }
    }

    if (!user) {
        return (
            <div>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
                        <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
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
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your profile...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* User Details Card */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 rounded-full p-3 mr-4">
                                    <User className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                                    <p className="text-gray-600">Your account details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium text-gray-800">{userDetails?.name || user.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-800">{userDetails?.email || user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {userDetails?.username && (
                                        <div className="flex items-center space-x-3">
                                            <User className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Username</p>
                                                <p className="font-medium text-gray-800">{userDetails.username}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {userDetails?.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium text-gray-800">{userDetails.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Member Since</p>
                                            <p className="font-medium text-gray-800">
                                                {formatDate(userDetails?.created_at || user.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="bg-green-100 rounded-full p-3 mr-4">
                                        <History className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                                        <p className="text-gray-600">Your latest purchases</p>
                                    </div>
                                </div>
                                <Link
                                    to="/history"
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    View All
                                </Link>
                            </div>

                            {purchaseHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No orders yet</p>
                                    <Link
                                        to="/home"
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {purchaseHistory.map((order, index) => (
                                        <div key={order.order_id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        Order #{order.order_id?.slice(-8) || `ORD-${index + 1}`}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(order.order_date)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">
                                                        ${(order.total_amount || 0).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} item{(order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0) !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats and Quick Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Account Stats */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Account Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Orders</span>
                                    <span className="font-bold text-blue-600">{stats.totalOrders}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Spent</span>
                                    <span className="font-bold text-green-600">${stats.totalSpent.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Items in Cart</span>
                                    <span className="font-bold text-orange-600">{stats.itemsInCart}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    to="/cart"
                                    className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                                    <span className="text-gray-800">View Cart</span>
                                </Link>
                                <Link
                                    to="/history"
                                    className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <History className="h-5 w-5 text-blue-600" />
                                    <span className="text-gray-800">Order History</span>
                                </Link>
                                <Link
                                    to="/home"
                                    className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <Settings className="h-5 w-5 text-blue-600" />
                                    <span className="text-gray-800">Continue Shopping</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
