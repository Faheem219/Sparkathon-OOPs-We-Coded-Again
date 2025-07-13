import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in from localStorage
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        if (storedUser && token) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const response = await api.auth.login({ email, password })
            const userData = response.data.user
            const token = response.data.access_token

            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('token', token)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            }
        }
    }

    const signup = async (userData) => {
        try {
            const response = await api.auth.signup(userData)
            const user = response.data.user
            const token = response.data.access_token

            setUser(user)
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('token', token)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Signup failed'
            }
        }
    }

    const logout = async () => {
        try {
            await api.auth.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setUser(null)
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        }
    }

    const value = {
        user,
        loading,
        login,
        signup,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
