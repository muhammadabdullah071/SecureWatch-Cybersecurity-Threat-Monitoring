import { Outlet } from 'react-router-dom'
import { Shield } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secure-100/40 dark:from-secure-900/20 via-slate-50 dark:via-slate-950 to-slate-50 dark:to-slate-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0ZjQ2ZTUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-[0.08] dark:opacity-20" />

      <div className="relative w-full max-w-md px-4">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secure-600 shadow-2xl shadow-secure-600/30 animate-glow">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Secure<span className="text-secure-600 dark:text-secure-400">Watch</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enterprise Cybersecurity Threat Monitoring
          </p>
        </div>

        <Outlet />

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
          &copy; {new Date().getFullYear()} SecureWatch. All rights reserved.
        </p>
      </div>
    </div>
  )
}
