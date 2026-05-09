import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, FileText, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const teacherNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
]

const studentNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
]

const personalNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/personal/upload', icon: Upload, label: 'Upload & Grade' },
]

export function Sidebar() {
  const { user } = useAuth()

  const navItems = user?.role === 'personal'
    ? personalNavItems
    : user?.role === 'teacher'
    ? teacherNavItems
    : studentNavItems

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AI</span>
          </div>
          <span className="font-semibold text-lg text-foreground">AI Grader</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          AI Grader v1.0
        </p>
      </div>
    </aside>
  )
}