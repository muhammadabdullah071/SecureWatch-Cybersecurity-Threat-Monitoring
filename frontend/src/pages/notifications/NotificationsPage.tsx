import { useNotifications } from '@/hooks/useNotifications'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCheck, Bell, BellOff } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="System alerts and notifications"
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BellOff className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium">No notifications</p>
              <p className="text-sm text-slate-500 mt-1">You&apos;re all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`transition-colors cursor-pointer hover:bg-slate-800/80 ${!n.read ? 'border-secure-600/30 bg-slate-800/50' : ''}`}
              onClick={() => !n.read && markAsRead(n.id)}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-secure-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm ${n.read ? 'text-slate-400' : 'text-white font-medium'}`}>{n.title}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{n.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{n.message}</p>
                  <p className="text-xs text-slate-600 mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAsRead(n.id) }}>
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
