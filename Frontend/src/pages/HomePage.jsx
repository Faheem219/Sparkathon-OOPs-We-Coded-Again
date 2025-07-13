import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MessageCircle, Search, ShoppingCart, Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

const HomePage = () => {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await api.products.getAll()
            const allProducts = response.data.products || response.data || []

            // Group products by root category
            const categorizedProducts = {}
            allProducts.forEach(product => {
                const category = product.root_category_name || product.category || 'Other'
                if (!categorizedProducts[category]) {
                    categorizedProducts[category] = []
                }
                categorizedProducts[category].push(product)
            })

            setProducts(allProducts)
            setCategories(categorizedProducts)
        } catch (error) {
            console.error('Error fetching products:', error)
            setError('Failed to load products. Showing demo data instead.')
            // In a real app, you might load demo data here
        } finally {
            setLoading(false)
        }
    }

    const CategorySlider = ({ categoryName, products }) => {
        const [currentIndex, setCurrentIndex] = useState(0)
        const itemsPerView = 4

        const nextSlide = () => {
            setCurrentIndex(prev =>
                prev + itemsPerView >= products.length ? 0 : prev + itemsPerView
            )
        }

        const prevSlide = () => {
            setCurrentIndex(prev =>
                prev === 0 ? Math.max(0, products.length - itemsPerView) : prev - itemsPerView
            )
        }

        const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView)

        return (
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="h-8 w-1 bg-blue-600 rounded-r mr-3"></div>
                        <h2 className="text-2xl font-bold text-gray-800">{categoryName}</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to={`/category/${categoryName.toLowerCase().replace(' & ', '-').replace(' ', '-')}`}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                            View All
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                        <div className="flex space-x-2">
                            <button
                                onClick={prevSlide}
                                className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                                disabled={currentIndex + itemsPerView >= products.length}
                            >
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {visibleProducts.map((product) => (
                            <ProductCard key={product.product_id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const formatCategoryUrl = (categoryName) => {
        return encodeURIComponent(categoryName)
    }

    const featuredCategories = [
        { name: 'Electronics', icon: '📱' },
        { name: 'Clothing', icon: '👕' },
        { name: 'Beauty', icon: '💄' },
        { name: 'Home', icon: '🏠' },
        { name: 'Food', icon: '🛒' },
        { name: 'Health', icon: '💊' },
        { name: 'Arts & Crafts', icon: '🎨' },
        { name: 'Pets', icon: '🐕' },
        { name: 'Baby', icon: '👶' },
        { name: 'Toys', icon: '🎮' },
        { name: 'Sports', icon: '⚽' },
        { name: 'Books', icon: '📚' }
    ]

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-gray-200 h-48 animate-pulse"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/3 mt-4 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 py-20 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Welcome to Walmart
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Discover amazing deals and shop with confidence
                    </p>

                    <div className="relative max-w-2xl mx-auto">
                        <form onSubmit={handleSearch}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-600" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for products, brands, and categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-4 pl-10 pr-4 rounded-full bg-gray-50 text-gray-800 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                            />
                            <button 
                                type="submit"
                                className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition-colors"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
                    {featuredCategories.map((category) => (
                        <Link
                            key={category.name}
                            to={`/category/${formatCategoryUrl(category.name)}`}
                            className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow border border-gray-100 group"
                        >
                            <div className="bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                                <span className="text-2xl">{category.icon}</span>
                            </div>
                            <h3 className="font-medium text-gray-800">{category.name}</h3>
                        </Link>
                    ))}
                </div>

                {/* Deals Section */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="h-8 w-1 bg-red-500 rounded-r mr-3"></div>
                            <h2 className="text-2xl font-bold text-gray-800">Today's Best Deals</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(0, 4).map((product) => (
                            <div key={product.product_id} className="relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold py-1 px-2 rounded">
                                    SALE
                                </div>
                                <div className="p-4">
                                    <ProductCard product={product} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Categories */}
                {error && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-8">
                        <p>{error}</p>
                    </div>
                )}

                {Object.entries(categories).map(([categoryName, products]) => (
                    <CategorySlider
                        key={categoryName}
                        categoryName={categoryName}
                        products={products}
                    />
                ))}
            </div>

            {/* Chatbot Float Button */}
            <div className="fixed bottom-6 right-6 z-40 group">
                <Link
                    to="/chatbot"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center"
                    aria-label="Customer Support Chat"
                >
                    <MessageCircle className="h-6 w-6" />
                </Link>
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Need help?
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12 mt-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4">Customer Service</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white">Shipping Policy</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white">Returns & Exchanges</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">About Us</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-300 hover:text-white">Our Story</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white">Careers</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white">Terms & Conditions</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Shop</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-300 hover:text-white">Gift Cards</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white">Weekly Ad</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white">Store Locator</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white">Track Order</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Stay Connected</h3>
                            <p className="text-gray-300 mb-4">Subscribe to our newsletter for updates</p>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="px-4 py-2 rounded-l text-gray-800 w-full focus:outline-none"
                                />
                                <button className="bg-blue-600 hover:bg-blue-700 px-4 rounded-r">Join</button>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                        © 2023 Walmart. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default HomePage