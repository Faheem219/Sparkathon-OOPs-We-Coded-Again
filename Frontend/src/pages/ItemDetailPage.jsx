import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Plus, Minus, ArrowLeft, Truck, Shield, RotateCcw, Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ItemDetailPage = () => {
    const { itemId } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [addingToCart, setAddingToCart] = useState(false)
    const [wishlisted, setWishlisted] = useState(false)
    const [showFullDescription, setShowFullDescription] = useState(false)

    const { addToCart, cart, updateQuantity } = useCart()
    const { user } = useAuth()

    const currentQuantity = cart.items[itemId] || 0

    // Constants for description truncation
    const MAX_DESCRIPTION_LENGTH = 200
    const shouldTruncateDescription = product?.description && product.description.length > MAX_DESCRIPTION_LENGTH

    const getDisplayedDescription = () => {
        if (!product?.description) return ''
        if (!shouldTruncateDescription || showFullDescription) {
            return product.description
        }
        return product.description.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
    }

    useEffect(() => {
        fetchProduct()
    }, [itemId])

    const fetchProduct = async () => {
        try {
            setLoading(true)
            const response = await api.products.getById(itemId)
            setProduct(response.data.product)
            setError('')
        } catch (error) {
            console.error('Error fetching product:', error)
            setError('Product not found')
            setProduct(null)
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = async () => {
        if (!user) {
            alert('Please login to add items to cart')
            return
        }

        setAddingToCart(true)
        const result = await addToCart(itemId, 1)
        if (result.success) {
            // Show success message or toast
        } else {
            alert(result.error)
        }
        setAddingToCart(false)
    }

    const handleQuantityChange = async (newQuantity) => {
        if (!user) return

        setAddingToCart(true)
        const result = await updateQuantity(itemId, newQuantity)
        if (!result.success) {
            alert(result.error)
        }
        setAddingToCart(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading product details...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center py-20">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                        <p className="text-xl font-medium text-gray-800 mt-6 mb-4">Product not found</p>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">
                            We couldn't find the product you're looking for. It may have been removed or is temporarily unavailable.
                        </p>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center mx-auto"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to previous page
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const images = (product.image_urls || [product.image_url || '/placeholder-image.jpg']).slice(0, 7)

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="aspect-square rounded-lg overflow-hidden relative">
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg'
                                    }}
                                />
                                <button
                                    onClick={() => setWishlisted(!wishlisted)}
                                    className={`absolute top-4 right-4 p-2 rounded-full shadow-md ${wishlisted ? 'bg-rose-100 text-rose-500' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                <h3 className="text-gray-500 text-sm font-medium mb-3">Product Images</h3>
                                <div className="flex flex-wrap gap-3">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border ${selectedImage === index ? 'border-indigo-600 border-2' : 'border-gray-200'}`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg'
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        {/* Brand and Title */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    {product.brand && (
                                        <p className="text-indigo-600 font-medium text-lg">{product.brand}</p>
                                    )}
                                    <h1 className="text-3xl font-bold text-gray-900 mt-1 mb-2">
                                        {product.name}
                                    </h1>

                                    {/* Rating */}
                                    {product.rating && (
                                        <div className="flex items-center space-x-2 mb-4">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-5 w-5 ${i < Math.floor(product.rating)
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-gray-600">
                                                {product.rating.toFixed(1)} ({product.review_count} reviews)
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="text-3xl font-bold text-gray-900">
                                    ${product.price.toFixed(2)}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-5 pt-5 border-t border-gray-100">
                                <h3 className="font-medium text-gray-800 mb-3">Description</h3>
                                <div className="text-gray-600 leading-relaxed">
                                    <p className="whitespace-pre-line">
                                        {getDisplayedDescription()}
                                    </p>
                                    {shouldTruncateDescription && (
                                        <button
                                            onClick={() => setShowFullDescription(!showFullDescription)}
                                            className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors flex items-center"
                                        >
                                            {showFullDescription ? (
                                                <>
                                                    <span>Show Less</span>
                                                    <svg className="ml-1 h-4 w-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Read More</span>
                                                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-medium text-gray-800 mb-3">Storage</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-5 py-3 rounded-lg transition-colors ${selectedSize === size
                                                ? 'bg-indigo-100 border border-indigo-300 text-indigo-700 font-medium'
                                                : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-medium text-gray-800 mb-3">Color</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-5 py-3 rounded-lg transition-colors ${selectedColor === color
                                                ? 'bg-indigo-100 border border-indigo-300 text-indigo-700 font-medium'
                                                : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.specifications && product.specifications.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Specifications</h3>
                                <div className="space-y-3">
                                    {product.specifications.map((spec, index) => (
                                        <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-gray-600">{spec.name}:</span>
                                            <span className="text-gray-800 font-medium">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold text-gray-800 mb-4">Features</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                                    <div className="bg-indigo-100 p-2 rounded-lg">
                                        <Truck className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Free Shipping</p>
                                        <p className="text-sm text-gray-600 mt-1">Delivered in 3-5 days</p>
                                    </div>
                                </div>

                                {product.free_returns && (
                                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                                        <div className="bg-indigo-100 p-2 rounded-lg">
                                            <RotateCcw className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Free Returns</p>
                                            <p className="text-sm text-gray-600 mt-1">30 day return policy</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                                    <div className="bg-indigo-100 p-2 rounded-lg">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Warranty</p>
                                        <p className="text-sm text-gray-600 mt-1">1 year manufacturer</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                            <div className="space-y-5">
                                {currentQuantity === 0 ? (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {addingToCart ? (
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : null}
                                        {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium text-gray-700">Quantity</div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleQuantityChange(currentQuantity - 1)}
                                                disabled={addingToCart}
                                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full disabled:opacity-50 transition-colors"
                                            >
                                                <Minus className="h-5 w-5 text-gray-700" />
                                            </button>
                                            <span className="font-medium text-lg min-w-[2rem] text-center">
                                                {currentQuantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(currentQuantity + 1)}
                                                disabled={addingToCart}
                                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full disabled:opacity-50 transition-colors"
                                            >
                                                <Plus className="h-5 w-5 text-gray-700" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="text-center text-gray-500 text-sm">
                                    <p>Free shipping on orders over $50</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemDetailPage