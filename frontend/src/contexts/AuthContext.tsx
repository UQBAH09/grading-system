import { createContext, useContext, useState, type ReactNode } from 'react'

interface User {
  id: string
  username: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isDevMode: boolean
  login: (username: string, password: string) => Promise<void>
  loginAsDevUser: () => void
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'ai-grader-user'
const STORAGE_TOKEN = 'ai-grader-token'
const DEV_MODE_KEY = 'ai-grader-dev-mode'

const DEV_USER: User = {
  id: 'dev-user-001',
  username: 'devuser',
  name: 'Development User',
  role: 'teacher',
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

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Login failed: ${response.status}`)
      }

      const data = await response.json()

      // Store JWT token separately
      localStorage.setItem(STORAGE_TOKEN, data.token)

      const userData: User = {
        id: String(data.user_id),
        username: username,
        name: data.name,
        role: data.role,
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
    localStorage.removeItem(STORAGE_TOKEN)
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