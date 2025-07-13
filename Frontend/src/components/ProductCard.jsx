import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const ProductCard = ({ product, compact = false }) => {
    const [quantity, setQuantity] = useState(0)
    const [loading, setLoading] = useState(false)
    const { addToCart, cart, updateQuantity } = useCart()
    const { user } = useAuth()

    const currentQuantity = cart.items[product.product_id] || 0

    const handleAddToCart = async () => {
        if (!user) {
            alert('Please login to add items to cart')
            return
        }

        setLoading(true)
        const result = await addToCart(product.product_id, 1)
        if (result.success) {
            setQuantity(currentQuantity + 1)
        } else {
            alert(result.error)
        }
        setLoading(false)
    }

    const handleQuantityChange = async (newQuantity) => {
        if (!user) return

        setLoading(true)
        const result = await updateQuantity(product.product_id, newQuantity)
        if (result.success) {
            setQuantity(newQuantity)
        }
        setLoading(false)
    }

    const displayPrice = product.price || 0
    const displayRating = product.rating || 0
    const displayImage = product.image_url || product.image_urls?.[0] || '/placeholder-image.jpg'

    return (
        <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${compact ? 'p-3' : 'p-4'}`}>
            {/* Product Image */}
            <Link to={`/item/${product.product_id}`}>
                <div className={`${compact ? 'h-32' : 'h-48'} bg-gray-100 rounded-lg mb-3 overflow-hidden`}>
                    <img
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e) => {
                            e.target.src = '/placeholder-image.jpg'
                        }}
                    />
                </div>
            </Link>

            {/* Product Info */}
            <div className="space-y-2">
                <Link to={`/item/${product.product_id}`}>
                    <h3 className={`font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 ${compact ? 'text-sm' : 'text-base'
                        }`}>
                        {product.name}
                    </h3>
                </Link>

                {/* Brand */}
                {product.brand && (
                    <p className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                        {product.brand}
                    </p>
                )}

                {/* Rating */}
                {displayRating > 0 && (
                    <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${i < Math.floor(displayRating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                            ({product.review_count || 0})
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                    <span className={`font-bold text-blue-600 ${compact ? 'text-sm' : 'text-lg'}`}>
                        ${displayPrice.toFixed(2)}
                    </span>

                    {/* Free Returns Badge */}
                    {product.free_returns && (
                        <span className={`text-green-600 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                            Free Returns
                        </span>
                    )}
                </div>

                {/* Add to Cart / Quantity Controls */}
                <div className="mt-3">
                    {currentQuantity === 0 ? (
                        <button
                            onClick={handleAddToCart}
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 ${compact ? 'py-1.5 text-sm' : 'py-2'
                                }`}
                        >
                            {loading ? 'Adding...' : 'Add to Cart'}
                        </button>
                    ) : (
                        <div className="flex items-center justify-center space-x-3">
                            <button
                                onClick={() => handleQuantityChange(currentQuantity - 1)}
                                disabled={loading}
                                className="bg-gray-200 hover:bg-gray-300 p-1 rounded disabled:opacity-50"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-medium min-w-[2rem] text-center">
                                {currentQuantity}
                            </span>
                            <button
                                onClick={() => handleQuantityChange(currentQuantity + 1)}
                                disabled={loading}
                                className="bg-gray-200 hover:bg-gray-300 p-1 rounded disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductCard
