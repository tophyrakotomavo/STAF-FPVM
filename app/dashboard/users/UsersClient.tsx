// app/dashboard/users/UsersClient.tsx
'use client'
import { useState } from 'react'
import { Profile, Church, UserRole } from '@/lib/types'

// Note: User creation requires the service role key (done via API route)
interface Props { users: Profile[]; churches: Church[]; myRole: UserRole }

const ROLE_LABELS: Record<string, string> = {
  super_admin: '⚡ Super Admin',
  church_admin: '🏛️ Admin Fiangonana',
  leader: '👤 Leader',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-violet-50 text-violet-700 border-violet-200',
  church_admin: 'bg-blue-50 text-blue-700 border-blue-200',
  leader: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function UsersClient({ users: init, churches, myRole }: Props) {
  const [users] = useState<Profile[]>(init)
  const [filter, setFilter] = useState<string>('all')

  const filtered = users.filter(u => filter === 'all' || u.role === filter)

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900 mb-1">👤 Mpampiasa</h1>
          <p className="text-brand-400 text-sm">Ny mpampiasa rehetra ao amin'ny app</p>
        </div>
        <a href="/dashboard/users/new" className="btn-primary">➕ Hanampy mpampiasa</a>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 p-1 bg-brand-100 rounded-xl w-fit">
        {[['all','Rehetra'],['super_admin','Super Admin'],['church_admin','Admin'],['leader','Leader']].map(([r,l]) => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === r ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-500 hover:text-brand-700'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { role: 'super_admin', label: 'Super Admin', icon: '⚡' },
          { role: 'church_admin', label: 'Admin', icon: '🏛️' },
          { role: 'leader', label: 'Leader', icon: '👤' },
        ].map(({ role, label, icon }) => (
          <div key={role} className="bg-white rounded-xl border border-brand-100 p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="font-display font-bold text-2xl text-brand-900">
              {users.filter(u => u.role === role).length}
            </div>
            <div className="text-xs text-brand-400 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-brand-50 border-b border-brand-100">
              <th className="text-left px-5 py-3 text-xs font-black text-brand-400 tracking-wider">ANARANA</th>
              <th className="text-left px-5 py-3 text-xs font-black text-brand-400 tracking-wider">EMAIL</th>
              <th className="text-left px-5 py-3 text-xs font-black text-brand-400 tracking-wider">ANDRAIKITRA</th>
              <th className="text-left px-5 py-3 text-xs font-black text-brand-400 tracking-wider">FIANGONANA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-brand-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700
                      flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-brand-900 text-sm">{u.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-brand-500">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-brand-500">
                  {(u as any).church?.name ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-brand-300">
            <div className="text-4xl mb-3">👤</div>
            <div className="font-medium">Tsy misy mpampiasa</div>
          </div>
        )}
      </div>

      {/* Note about user creation */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        <strong>📝 Fanamarihana:</strong> Ny fanambarana ny mpampiasa vaovao dia atao amin'ny alalan'ny
        Supabase Auth Admin API. Ampiasao ny <code className="bg-amber-100 px-1 rounded text-xs">createUser</code> function
        amin'ny <code className="bg-amber-100 px-1 rounded text-xs">/api/admin/create-user</code> route.
      </div>
    </div>
  )
}
