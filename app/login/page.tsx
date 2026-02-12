// app/login/page.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #2E1065 0%, #4C1D95 40%, #6D28D9 100%)' }}>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #C4B5FD, transparent)' }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="text-4xl">✝️</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">MiM</h1>
          <p className="text-purple-200 text-sm tracking-widest font-medium">
            SAMPANA MANAGER
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <h2 className="font-display text-2xl font-bold text-white mb-6">Hiditra ao anaty</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="anao@email.com" required
                className="w-full px-4 py-3 rounded-xl text-brand-950 font-medium outline-none
                  bg-white/90 border-2 border-transparent focus:border-purple-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">Tenimiafina</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-3 rounded-xl text-brand-950 font-medium outline-none
                  bg-white/90 border-2 border-transparent focus:border-purple-400 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 rounded-xl px-4 py-3 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white text-brand-700 font-bold text-base
                hover:bg-purple-50 active:scale-[0.98] transition-all duration-150 shadow-lg mt-2
                disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? '⏳ Miandry...' : '🔐 Hiditra'}
            </button>
          </form>
        </div>

        <p className="text-center text-purple-300/60 text-xs mt-6">
          MiM Sampana Manager © 2026
        </p>
      </div>
    </div>
  )
}
