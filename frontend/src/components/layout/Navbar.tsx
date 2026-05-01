import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, User, Sun, Moon, ChevronDown, Mail, Shield } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Answer Sheets',
  '/results': 'Exam Results',
  '/student': 'Student Detail',
  '/stats': 'Statistics',
}

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) {
      return title
    }
  }
  return 'Dashboard'
}

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = getPageTitle(location.pathname)
  const { theme, toggleTheme } = useTheme()
  const { user, logout, isDevMode } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setIsDropdownOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Dev Mode Badge */}
        {isDevMode && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-status-yellow/10 border border-status-yellow/30">
            <Shield className="w-3.5 h-3.5 text-status-yellow" />
            <span className="text-xs font-medium text-status-yellow">Dev Mode</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {user?.role || 'Teacher'}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
              {/* User Info Header */}
              <div className="px-4 py-3 bg-accent/50 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.role || 'Teacher'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <div className="px-4 py-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user?.email || 'user@example.com'}</span>
                </div>
                
                <div className="my-1 mx-3 border-t border-border" />
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
