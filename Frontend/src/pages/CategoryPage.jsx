import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Filter, SortAsc } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

const CategoryPage = () => {
    const { categoryName } = useParams()
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState('name')
    const [priceRange, setPriceRange] = useState([0, 1000])
    const [showFilters, setShowFilters] = useState(false)
    const [selectedBrands, setSelectedBrands] = useState([])

    const categoryDisplayName = categoryName 
        ? decodeURIComponent(categoryName)
        : 'Products'

    useEffect(() => {
        fetchCategoryProducts()
    }, [categoryName])

    useEffect(() => {
        applyFiltersAndSort()
    }, [products, sortBy, priceRange, selectedBrands])

    const fetchCategoryProducts = async () => {
        try {
            setLoading(true)
            const response = await api.products.getByCategory(categoryDisplayName)
            setProducts(response.data.products || [])
        } catch (error) {
            console.error('Error fetching category products:', error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const applyFiltersAndSort = () => {
        let filtered = [...products]

        // Filter by price range
        filtered = filtered.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        )

        // Filter by selected brands
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(product =>
                selectedBrands.includes(product.brand)
            )
        }

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price
                case 'price-high':
                    return b.price - a.price
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0)
                case 'name':
                default:
                    return a.name.localeCompare(b.name)
            }
        })

        setFilteredProducts(filtered)
    }

    const availableBrands = [...new Set(products.map(p => p.brand).filter(Boolean))]
    const maxPrice = Math.max(...products.map(p => p.price || 0), 1000)

    const handleBrandToggle = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        )
    }

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading {categoryDisplayName}...</p>
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{categoryDisplayName}</h1>
                        <p className="text-gray-600 mt-2">
                            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                        </p>
                    </div>

                    {/* Sort and Filter Controls */}
                    <div className="flex items-center space-x-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Customer Rating</option>
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <div className="w-64 bg-white p-6 rounded-lg shadow-md h-fit">
                            <h3 className="font-semibold text-gray-800 mb-4">Filters</h3>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-700 mb-2">Price Range</h4>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max={maxPrice}
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>$0</span>
                                        <span>${priceRange[1]}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Brands */}
                            {availableBrands.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-700 mb-2">Brands</h4>
                                    <div className="space-y-2">
                                        {availableBrands.map(brand => (
                                            <label key={brand} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(brand)}
                                                    onChange={() => handleBrandToggle(brand)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-gray-700">{brand}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clear Filters */}
                            <button
                                onClick={() => {
                                    setSelectedBrands([])
                                    setPriceRange([0, maxPrice])
                                }}
                                className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {/* Products Grid */}
                    <div className="flex-1">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
                                <button
                                    onClick={() => {
                                        setSelectedBrands([])
                                        setPriceRange([0, maxPrice])
                                    }}
                                    className="text-blue-600 hover:text-blue-800 font-medium mt-2"
                                >
                                    Clear filters to see all products
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.product_id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryPage
