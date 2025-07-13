import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../services/api'
import {
    ShoppingCart,
    History,
    Search,
    Menu,
    X,
    User,
    LogOut,
    Repeat,
    ChevronDown,
    ChevronUp,
    Loader
} from 'lucide-react'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [categories, setCategories] = useState([])
    const [isReordering, setIsReordering] = useState(false)
    const { user, logout } = useAuth()
    const { getCartItemCount, fetchCart } = useCart()
    const navigate = useNavigate()
    const location = useLocation()

    // Check if we're on the homepage to conditionally show search bar
    const isHomePage = location.pathname === '/home' || location.pathname === '/'

    // Root categories that we want to display in navbar
    const displayCategories = [
        'Electronics',
        'Clothing',
        'Beauty',
        'Home',
        'Food',
        'Health and Medicine',
        'Arts Crafts & Sewing',
        'Pets',
        'Baby',
        'Toys',
        'Sports',
        'Books'
    ]

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await api.products.getCategories()
            const allCategories = response.data.categories || []

            // Filter to show only root categories that exist in our data
            const rootCategories = allCategories.filter(cat =>
                displayCategories.includes(cat)
            )
            setCategories(rootCategories)
        } catch (error) {
            console.error('Error fetching categories:', error)
            // Fallback to default categories if API fails
            setCategories(displayCategories.slice(0, 6))
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
            setIsMenuOpen(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
        setIsUserMenuOpen(false)
        setIsMenuOpen(false)
    }

    const handleReorder = async () => {
        setIsReordering(true)
        setIsMenuOpen(false)
        
        try {
            const response = await api.chatbot.reorder()
            
            if (response.data.items_added > 0) {
                // Refresh cart count
                await fetchCart()
                
                // Show success message and redirect to cart
                alert(`Successfully added ${response.data.items_added} recommended products to your cart!`)
                navigate('/cart')
            } else {
                alert('No recommendations available. Try placing some orders first!')
            }
        } catch (error) {
            console.error('Reorder error:', error)
            
            // Show error popup
            const errorMessage = error.response?.data?.detail || 'Failed to process reorder request. Please try again.'
            alert(`Reorder failed: ${errorMessage}`)
        } finally {
            setIsReordering(false)
        }
    }

    return (
        <nav className="bg-blue-800 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Top Bar */}
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center space-x-2">
                        <div className="bg-yellow-400 p-2 rounded-lg">
                            <span className="text-blue-800 font-bold text-xl">W</span>
                        </div>
                        <span className="text-white font-bold text-2xl">Walmart</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Categories Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                className="flex items-center text-white hover:text-yellow-300 transition-colors"
                            >
                                <span>Categories</span>
                                {isCategoriesOpen ? (
                                    <ChevronUp className="ml-1 h-4 w-4" />
                                ) : (
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                )}
                            </button>
                            {isCategoriesOpen && (
                                <div className="absolute top-full left-0 bg-white shadow-xl rounded-lg mt-2 w-60 py-2 z-50">
                                    <div className="grid grid-cols-2 gap-1">
                                        {categories.map((category) => (
                                            <Link
                                                key={category}
                                                to={`/category/${encodeURIComponent(category)}`}
                                                className="px-4 py-2 text-gray-800 hover:bg-blue-50 flex items-center group"
                                                onClick={() => setIsCategoriesOpen(false)}
                                            >
                                                <span className="group-hover:text-blue-600 transition-colors">
                                                    {category}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reorder */}
                        <button
                            onClick={handleReorder}
                            disabled={isReordering}
                            className="flex items-center space-x-1 text-white hover:text-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isReordering ? (
                                <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                                <Repeat className="h-5 w-5" />
                            )}
                            <span>{isReordering ? 'Processing...' : 'Reorder'}</span>
                        </button>

                        {/* Purchase History */}
                        <Link
                            to="/history"
                            className="flex items-center space-x-1 text-white hover:text-yellow-300 transition-colors"
                        >
                            <History className="h-5 w-5" />
                            <span>History</span>
                        </Link>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="flex items-center space-x-1 text-white hover:text-yellow-300 transition-colors relative"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span>Cart</span>
                            {getCartItemCount() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                                    {getCartItemCount()}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-1 text-white hover:text-yellow-300 transition-colors"
                                >
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center text-blue-800">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span>{user.name.split(' ')[0]}</span>
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute top-full right-0 bg-white shadow-xl rounded-lg mt-2 w-48 py-2 z-50">
                                        <div className="px-4 py-2 text-gray-800 border-b border-gray-100">
                                            Hello, {user.name.split(' ')[0]}
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            My Account
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center space-x-2 w-full px-4 py-2 text-gray-800 hover:bg-blue-50 text-left"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-white hover:text-yellow-300 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-4 md:hidden">
                        <Link
                            to="/cart"
                            className="relative text-white"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {getCartItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {getCartItemCount()}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white hover:text-yellow-300 transition-colors"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Search Bar - Desktop - Only show if NOT on homepage */}
                {!isHomePage && (
                    <div className="hidden md:block pb-4">
                        <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for products, brands, and categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md bg-white text-gray-800"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-yellow-400 hover:bg-yellow-500 px-6 py-3 rounded-r-lg transition-colors shadow-md ml-1 font-medium text-blue-800"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-blue-700 py-4 bg-blue-800">
                        {/* Search Bar - Mobile - Only show if NOT on homepage */}
                        {!isHomePage && (
                            <form onSubmit={handleSearch} className="flex mb-4 px-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-gray-800"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-r-lg transition-colors ml-1 font-medium text-blue-800"
                                >
                                    Go
                                </button>
                            </form>
                        )}

                        <div className="space-y-4 px-2">
                            {/* User Info */}
                            {user ? (
                                <div className="pb-2 border-b border-blue-700">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center text-blue-800">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.name}</p>
                                            <p className="text-blue-200 text-sm">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex space-x-2 pb-4 border-b border-blue-700">
                                    <Link
                                        to="/login"
                                        className="flex-1 text-center text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="flex-1 text-center bg-yellow-400 hover:bg-yellow-500 text-blue-800 py-2 rounded-lg font-medium transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Categories */}
                            <div>
                                <button
                                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                    className="flex items-center justify-between w-full text-white py-2"
                                >
                                    <span className="font-medium">Shop Categories</span>
                                    {isCategoriesOpen ? (
                                        <ChevronUp className="h-5 w-5" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5" />
                                    )}
                                </button>
                                {isCategoriesOpen && (
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {categories.map((category) => (
                                            <Link
                                                key={category}
                                                to={`/category/${encodeURIComponent(category)}`}
                                                className="px-3 py-2 bg-blue-700 text-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {category}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Navigation Links */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleReorder}
                                    disabled={isReordering}
                                    className="flex items-center space-x-3 w-full text-white py-2 px-1 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isReordering ? (
                                        <Loader className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Repeat className="h-5 w-5" />
                                    )}
                                    <span>{isReordering ? 'Processing...' : 'Reorder Items'}</span>
                                </button>
                                <Link
                                    to="/history"
                                    className="flex items-center space-x-3 w-full text-white py-2 px-1 hover:bg-blue-700 rounded-lg transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <History className="h-5 w-5" />
                                    <span>Purchase History</span>
                                </Link>
                                {user && (
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-3 w-full text-white py-2 px-1 hover:bg-blue-700 rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <User className="h-5 w-5" />
                                        <span>My Account</span>
                                    </Link>
                                )}
                            </div>

                            {/* Logout */}
                            {user && (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 w-full text-white py-2 px-1 hover:bg-blue-700 rounded-lg transition-colors mt-4"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar