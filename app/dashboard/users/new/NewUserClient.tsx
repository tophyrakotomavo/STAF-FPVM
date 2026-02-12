// app/dashboard/users/new/NewUserClient.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Church, UserRole } from '@/lib/types'

interface Props { churches: Church[]; callerRole: UserRole; callerChurchId?: string | null }

export default function NewUserClient({ churches, callerRole, callerChurchId }: Props) {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    role: 'leader' as UserRole,
    church_id: callerChurchId ?? churches[0]?.id ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const allowedRoles: { value: UserRole; label: string }[] = [
    ...(callerRole === 'super_admin' ? [{ value: 'super_admin' as UserRole, label: '⚡ Super Admin' }] : []),
    { value: 'church_admin', label: '🏛️ Admin Fiangonana' },
    { value: 'leader', label: '👤 Leader Sampana' },
  ]

  const submit = async () => {
    if (!form.full_name || !form.email || !form.password) { setError('Fenoy ny saha rehetra!'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Nisy lesoka'); setLoading(false) }
    else { setSuccess(true); setTimeout(() => router.push('/dashboard/users'), 1500) }
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-brand-400 hover:text-brand-700 text-sm font-medium mb-3 flex items-center gap-1">
          ← Hiverina
        </button>
        <h1 className="font-display text-2xl font-bold text-brand-900 mb-1">👤 Mpampiasa vaovao</h1>
        <p className="text-brand-400 text-sm">Hamorona kaonty ho an'ny mpampiasa vaovao</p>
      </div>

      <div className="bg-white rounded-2xl p-7 border border-brand-100 shadow-sm">
        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-display font-bold text-brand-900 text-xl mb-2">Vita!</h3>
            <p className="text-brand-400">Voaforona ny kaonty. Miverina...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">ANARANA FENO *</label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                placeholder="Rakoto Jean" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">EMAIL *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="rakoto@email.com" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">TENIMIAFINA *</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                placeholder="Farafaha-kely 8 litera" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">ANDRAIKITRA *</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value as UserRole})}
                className="input-base">
                {allowedRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {form.role !== 'super_admin' && (
              <div>
                <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">FIANGONANA *</label>
                <select value={form.church_id} onChange={e => setForm({...form, church_id: e.target.value})}
                  className="input-base" disabled={callerRole === 'church_admin'}>
                  {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">⚠️ {error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => router.back()} className="btn-ghost flex-1">Ajanona</button>
              <button onClick={submit} disabled={loading} className="btn-primary flex-1">
                {loading ? '⏳ Miandry...' : '✅ Hamorona'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
