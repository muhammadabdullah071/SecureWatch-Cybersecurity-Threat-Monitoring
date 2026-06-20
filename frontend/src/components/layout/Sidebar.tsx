import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldAlert,
  AlertTriangle,
  BrainCircuit,
  BarChart3,
  Users,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Role } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/threats', label: 'Threats', icon: ShieldAlert },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/threat-intel', label: 'Threat Intelligence', icon: BrainCircuit },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const isAdmin = user?.role === Role.ADMIN

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-xl transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-16 items-center border-b border-slate-200 dark:border-slate-800 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors w-full"
        >
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secure-600 shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Secure<span className="text-secure-500">Watch</span>
              </span>
            )}
          </div>
        </button>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null
              const Icon = item.icon
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        collapsed && 'justify-center px-2',
                        isActive
                          ? 'bg-secure-100 dark:bg-secure-600/20 text-secure-700 dark:text-secure-400'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="ml-2">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-3">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-secure-100 dark:bg-secure-600/20 text-secure-700 dark:text-secure-400 text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'mt-2 flex items-center justify-center w-full rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all',
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  )
}
