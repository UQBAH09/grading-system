import { createContext, useContext, useState, type ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isDevMode: boolean
  login: (email: string, password: string) => Promise<void>
  loginAsDevUser: () => void
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'ai-grader-user'
const DEV_MODE_KEY = 'ai-grader-dev-mode'

// Mock user for development/testing only
const DEV_USER: User = {
  id: 'dev-user-001',
  email: 'dev@example.com',
  name: 'Development User',
  role: 'Teacher',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    }
    return null
  })
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DEV_MODE_KEY) === 'true'
    }
    return false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real login - makes API call to /auth/login
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Login failed: ${response.status}`)
      }

      const data = await response.json()
      const userData: User = {
        id: data.user?.id || data.id,
        email: data.user?.email || email,
        name: data.user?.name || data.name || 'User',
        role: data.user?.role || data.role || 'Teacher',
      }
      
      setUser(userData)
      setIsDevMode(false)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      localStorage.removeItem(DEV_MODE_KEY)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Dev mode login - bypasses API for development/testing
  const loginAsDevUser = () => {
    setUser(DEV_USER)
    setIsDevMode(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEV_USER))
    localStorage.setItem(DEV_MODE_KEY, 'true')
  }

  const logout = () => {
    setUser(null)
    setIsDevMode(false)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(DEV_MODE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isDevMode,
        login,
        loginAsDevUser,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
