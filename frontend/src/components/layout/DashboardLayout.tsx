import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      <Sidebar isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
