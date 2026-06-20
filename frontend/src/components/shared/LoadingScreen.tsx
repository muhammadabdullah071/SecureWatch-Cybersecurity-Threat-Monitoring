import { Shield } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secure-600 shadow-2xl shadow-secure-600/30 animate-glow">
        <Shield className="h-8 w-8 text-white animate-pulse" />
      </div>
      <p className="mt-6 text-sm text-slate-400 font-mono">Loading SecureWatch...</p>
      <div className="mt-4 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-secure-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-secure-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 rounded-full bg-secure-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
