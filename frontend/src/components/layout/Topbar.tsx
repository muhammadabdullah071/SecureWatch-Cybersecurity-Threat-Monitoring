import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useNotifications } from '@/hooks/useNotifications'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { Notification } from '@/types'

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  threats: 'Threats',
  'threats/new': 'New Threat',
  incidents: 'Incidents',
  'incidents/new': 'New Incident',
  'threat-intel': 'Threat Intelligence',
  analytics: 'Analytics',
  users: 'Users',
  'audit-logs': 'Audit Logs',
  notifications: 'Notifications',
  settings: 'Settings',
  profile: 'Profile',
}

const searchablePages = [
  { label: 'Dashboard', path: '/dashboard', keywords: 'home overview main' },
  { label: 'Threats', path: '/threats', keywords: 'threat attack vulnerability' },
  { label: 'New Threat', path: '/threats/new', keywords: 'create add new threat' },
  { label: 'Incidents', path: '/incidents', keywords: 'incident breach event' },
  { label: 'New Incident', path: '/incidents/new', keywords: 'create add new incident' },
  { label: 'Threat Intelligence', path: '/threat-intel', keywords: 'intel feed intelligence threat' },
  { label: 'Analytics', path: '/analytics', keywords: 'analytics chart graph statistics' },
  { label: 'Users', path: '/users', keywords: 'user account people team' },
  { label: 'Audit Logs', path: '/audit-logs', keywords: 'audit log trail history' },
  { label: 'Notifications', path: '/notifications', keywords: 'notification alert bell' },
  { label: 'Settings', path: '/settings', keywords: 'settings preferences config' },
  { label: 'Profile', path: '/profile', keywords: 'profile account me' },
]

const notificationIcons: Record<string, typeof Bell> = {
  threat: ShieldAlert,
  incident: AlertTriangle,
  info: Info,
  success: CheckCircle,
}

const notificationColors: Record<string, string> = {
  threat: 'text-critical-500 bg-critical-100 dark:bg-critical-900/30',
  incident: 'text-warning-500 bg-warning-100 dark:bg-warning-900/30',
  info: 'text-secure-500 bg-secure-100 dark:bg-secure-900/30',
  success: 'text-success-500 bg-success-100 dark:bg-success-900/30',
}

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((seg, i) => ({
    label: routeNames[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }))

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const filteredResults = searchQuery.trim()
    ? searchablePages.filter(
        (page) =>
          page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const handleSearchSelect = (path: string) => {
    setSearchQuery('')
    setShowSearchResults(false)
    navigate(path)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const NotificationIcon = ({ type }: { type: string }) => {
    const Icon = notificationIcons[type] || Bell
    return <Icon className="h-4 w-4" />
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden text-slate-700 dark:text-slate-400">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Home className="h-4 w-4" />
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
            <span className={i === breadcrumbs.length - 1 ? 'text-slate-900 dark:text-slate-200 font-medium' : ''}>
              {crumb.label}
            </span>
          </span>
        ))}
      </div>

      <div className="flex-1" />

      <div ref={searchRef} className="hidden sm:block relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search threats, incidents..."
          className="w-64 pl-9 h-9 text-sm bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowSearchResults(true)
          }}
          onFocus={() => setShowSearchResults(true)}
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setShowSearchResults(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {showSearchResults && searchQuery && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
            {filteredResults.length > 0 ? (
              <div className="py-1 max-h-64 overflow-y-auto">
                {filteredResults.map((result) => (
                  <button
                    key={result.path}
                    onClick={() => handleSearchSelect(result.path)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{result.label}</span>
                    <span className="ml-auto text-xs text-slate-400">{result.path}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-sm text-slate-500 text-center">
                No results found for "<span className="font-medium">{searchQuery}</span>"
              </div>
            )}
          </div>
        )}
      </div>

      <Button variant="ghost" size="icon" className="sm:hidden text-slate-700 dark:text-slate-400" onClick={() => setSearchOpen(!searchOpen)}>
        <Search className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DropdownMenuLabel className="flex items-center justify-between text-slate-900 dark:text-slate-200">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-secure-600 dark:text-secure-400 hover:underline font-normal"
              >
                Mark all as read
              </button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'flex items-start gap-3 w-full px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50',
                    !notification.read && 'bg-secure-50/50 dark:bg-secure-600/5'
                  )}
                >
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    notificationColors[notification.type] || 'text-slate-500 bg-slate-100 dark:bg-slate-700'
                  )}>
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm truncate',
                      notification.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-200 font-medium'
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{notification.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(notification.createdAt)}</p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-secure-500 mt-2 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                onClick={() => navigate('/notifications')}
                className="justify-center text-sm text-secure-600 dark:text-secure-400 font-medium"
              >
                View all notifications
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secure-100 dark:bg-secure-600/20 text-secure-700 dark:text-secure-400 text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
          <DropdownMenuItem onClick={() => navigate('/profile')} className="text-slate-700 dark:text-slate-300">
            <User className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')} className="text-slate-700 dark:text-slate-300">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-critical-400">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
