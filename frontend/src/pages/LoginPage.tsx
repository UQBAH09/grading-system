import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GraduationCap, Sun, Moon, AlertCircle, Code } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { login, loginAsDevUser, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
    }
  }

  const handleDevLogin = () => {
    loginAsDevUser()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/20 via-background to-background" />
      
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 shadow-sm"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
      
      <Card className="relative w-full max-w-md shadow-xl border border-border">
        <CardHeader className="text-center pb-6">
          {/* Logo */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome to AI Grader</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-input bg-background accent-primary" 
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Dev Mode Button - Clearly separated from real login */}
          <button
            type="button"
            onClick={handleDevLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-status-yellow/50 bg-status-yellow/5 text-status-yellow hover:bg-status-yellow/10 hover:border-status-yellow transition-all duration-200"
          >
            <Code className="w-4 h-4" />
            <span className="font-medium">Enter Dev Mode</span>
          </button>
          <p className="mt-2 text-xs text-center text-muted-foreground">
            For development and testing only - bypasses authentication
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <a href="#" className="text-primary hover:underline font-medium">
                Contact Admin
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
