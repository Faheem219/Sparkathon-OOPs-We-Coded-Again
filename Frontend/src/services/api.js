import axios from 'axios'

// Set up axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Add token to requests if available
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle token expiration
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const api = {
    // Auth endpoints
    auth: {
        login: (credentials) => axios.post('/auth/login', credentials),
        signup: (userData) => axios.post('/auth/signup', userData),
        logout: () => axios.post('/auth/logout'),
        getMe: () => axios.get('/auth/me')
    },

    // Product endpoints
    products: {
        getAll: (params = {}) => axios.get('/items', { params }),
        getById: (id) => axios.get(`/items/${id}`),
        search: (query) => axios.get(`/items/search/${encodeURIComponent(query)}`),
        getCategories: () => axios.get('/items/categories/list'),
        getByCategory: (category) => axios.get(`/items/category/${encodeURIComponent(category)}`)
    },

    // Cart endpoints
    cart: {
        get: () => axios.get('/user/cart'),
        add: (itemData) => axios.post('/user/cart/add', itemData),
        update: (itemData) => axios.put('/user/cart/update', itemData),
        remove: (productId) => axios.delete(`/user/cart/remove/${productId}`),
        clear: () => axios.delete('/user/cart/clear'),
        getCount: () => axios.get('/user/cart/count'),
        placeOrder: (orderData) => axios.post('/user/cart/place-order', orderData)
    },

    // Purchase history endpoints
    purchases: {
        getHistory: (params = {}) => axios.get('/user/purchases', { params }),
        create: (purchaseData) => axios.post('/user/purchases', purchaseData),
        getById: (id) => axios.get(`/user/purchases/${id}`),
        reorder: (id) => axios.post(`/user/purchases/${id}/reorder`),
        getOrderHistory: (params = {}) => axios.get('/user/orders/history', { params })
    },

    // Chatbot endpoints
    chatbot: {
        sendMessage: (message) => axios.post('/chatbot/chat', { message }),
        getHistory: () => axios.get('/chatbot/history'),
        clearHistory: () => axios.delete('/chatbot/history'),
        getStatus: () => axios.get('/chatbot/status'),
        reorder: () => axios.post('/chatbot/reorder')
    }
}

export default api
