import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GraduationCap, Sun, Moon, AlertCircle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

export function SignupPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'student',
    teacher_username: ''
  })

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.username || !form.password || !form.name) {
      setError('Please fill in all required fields')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (form.role === 'student' && !form.teacher_username) {
      setError('Please enter your teacher\'s username')
      return
    }

    try {
      setIsLoading(true)

      const body: Record<string, string> = {
        username: form.username,
        password: form.password,
        name: form.name,
        role: form.role,
      }

      if (form.role === 'student') {
        body.teacher_username = form.teacher_username
      }

      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Signup failed: ${response.status}`)
      }

      const data = await response.json()

      // Store token and user
      localStorage.setItem('ai-grader-token', data.token)
      localStorage.setItem('ai-grader-user', JSON.stringify({
        id: String(data.user_id),
        username: form.username,
        name: data.name,
        role: data.role
      }))

      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/20 via-background to-background" />

      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 shadow-sm"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <Card className="relative w-full max-w-md shadow-xl border border-border">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Sign up to get started with AI Grader</CardDescription>
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
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />

            <Input
              type="text"
              label="Username"
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
            />

            {/* Role Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {['student', 'teacher', 'personal'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleChange('role', role)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 capitalize
                      ${form.role === role
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Teacher username field — only for students */}
            {form.role === 'student' && (
              <Input
                type="text"
                label="Teacher's Username"
                placeholder="Enter your teacher's username"
                value={form.teacher_username}
                onChange={(e) => handleChange('teacher_username', e.target.value)}
                required
              />
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="text-primary hover:underline font-medium">
                Sign In
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}