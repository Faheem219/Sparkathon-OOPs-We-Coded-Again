import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

const SearchPage = () => {
    const [searchParams] = useSearchParams()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const query = searchParams.get('q')

    useEffect(() => {
        if (query) {
            searchProducts()
        }
    }, [query])

    const searchProducts = async () => {
        try {
            setLoading(true)
            const response = await api.products.search(query)
            console.log('Search response:', response.data)
            setProducts(response.data.products || [])
        } catch (error) {
            console.error('Error searching products:', error)
            console.error('Error details:', error.response?.data)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Searching for "{query}"...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Search className="h-6 w-6 text-gray-500 mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Search Results</h1>
                        <p className="text-gray-600 mt-2">
                            {products.length} result{products.length !== 1 ? 's' : ''} for "{query}"
                        </p>
                    </div>
                </div>

                {/* Results */}
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No results found</h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't find any products matching "{query}". Try searching with different keywords.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.product_id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchPage
