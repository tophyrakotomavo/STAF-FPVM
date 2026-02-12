// app/dashboard/invitations/InvitationsClient.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Invitation, InvitationStatus, UserRole } from '@/lib/types'

const MOIS_SHORT = ['Jan','Fév','Mar','Avr','May','Jôn','Jôl','Aog','Sep','Okt','Nov','Des']

interface Props {
  invitations: Invitation[]
  mySampanaId: string | null
  role: UserRole
}

type FilterTab = 'received' | 'sent' | 'all'

export default function InvitationsClient({ invitations: initial, mySampanaId, role }: Props) {
  const [invitations, setInvitations] = useState<Invitation[]>(initial)
  const [filter, setFilter] = useState<FilterTab>(role === 'leader' ? 'received' : 'all')
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | 'all'>('all')
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [responseNote, setResponseNote] = useState('')
  const supabase = createClient()

  const fmt = (d: string) => {
    const [, m, day] = d.split('-')
    return `${parseInt(day)} ${MOIS_SHORT[parseInt(m)-1]} 2026`
  }

  const respond = async (id: string, status: 'accepted' | 'refused') => {
    const { data, error } = await supabase
      .from('invitations')
      .update({ status, responded_at: new Date().toISOString(), response_note: responseNote || null })
      .eq('id', id).select().single()
    if (!error && data) {
      setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, ...data } : inv))
      setRespondingId(null); setResponseNote('')
    }
  }

  const filtered = invitations
    .filter(inv => {
      if (filter === 'received') return inv.invitee_sampana_id === mySampanaId
      if (filter === 'sent') return inv.inviter_sampana_id === mySampanaId
      return true
    })
    .filter(inv => statusFilter === 'all' || inv.status === statusFilter)

  const pendingReceived = invitations.filter(i => i.invitee_sampana_id === mySampanaId && i.status === 'pending').length

  const tabs: [FilterTab, string, string][] = role === 'leader'
    ? [['received', '📥 Tonga', `${pendingReceived > 0 ? `(${pendingReceived})` : ''}`],
       ['sent', '📤 Nalefa', ''],
       ['all', '📋 Rehetra', '']]
    : [['all', '📋 Rehetra', '']]

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-900 mb-1">📨 Fanasana</h1>
        <p className="text-brand-400 text-sm">Hitantana ny invitations nalefa sy tonga</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 p-1 bg-brand-100 rounded-xl w-fit">
        {tabs.map(([t, l, badge]) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              filter === t ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-500 hover:text-brand-700'
            }`}>
            {l} {badge && <span className="ml-1 bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5">{badge}</span>}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {([['all','Rehetra'],['pending','Miandry'],['accepted','Noraisina'],['refused','Nandavana']] as [InvitationStatus|'all', string][]).map(([s,l]) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === s
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-brand-200 text-brand-500 hover:border-brand-400'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-300">
          <div className="text-5xl mb-4">📭</div>
          <div className="font-semibold">Tsy misy fanasana</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => {
            const isReceived = inv.invitee_sampana_id === mySampanaId
            const isMyInvite = inv.inviter_sampana_id === mySampanaId
            const canRespond = isReceived && inv.status === 'pending' && role === 'leader'
            const inviter = (inv as any).inviter_sampana
            const invitee = (inv as any).invitee_sampana

            return (
              <div key={inv.id} className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  {/* Direction badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black tracking-wider px-3 py-1 rounded-full ${
                        isReceived ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : isMyInvite ? 'bg-violet-50 text-violet-700 border border-violet-200'
                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}>
                        {isReceived ? '📥 TONGA' : isMyInvite ? '📤 NALEFA' : '📋'}
                      </span>
                      <StatusPill status={inv.status} />
                    </div>
                    <div className="text-xs text-brand-300">
                      {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  {/* Sampana info */}
                  <div className="flex items-center gap-3 mb-3">
                    <SampanaChip sampana={inviter} label="Mpanasa" />
                    <span className="text-brand-300 text-lg">→</span>
                    <SampanaChip sampana={invitee} label="Voasasa" />
                    <div className="ml-auto text-right">
                      <div className="text-xs text-brand-400 font-medium">📅 {fmt(inv.event_date)}</div>
                    </div>
                  </div>

                  {/* Message */}
                  {inv.message && (
                    <div className="bg-brand-50 rounded-xl px-4 py-2.5 text-sm text-brand-600 mb-3">
                      💬 {inv.message}
                    </div>
                  )}

                  {/* Response note */}
                  {inv.response_note && (
                    <div className={`rounded-xl px-4 py-2.5 text-sm mb-3 ${
                      inv.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      💬 {inv.response_note}
                    </div>
                  )}

                  {/* Respond actions */}
                  {canRespond && (
                    <div>
                      {respondingId === inv.id ? (
                        <div>
                          <textarea value={responseNote} onChange={e => setResponseNote(e.target.value)}
                            placeholder="Hafatra fandraisana (tena rana)..."
                            rows={2} className="input-base mb-3 resize-none text-sm" />
                          <div className="flex gap-2">
                            <button onClick={() => respond(inv.id, 'accepted')}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors">
                              ✅ Noraisina
                            </button>
                            <button onClick={() => respond(inv.id, 'refused')}
                              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors">
                              ❌ Nandavana
                            </button>
                            <button onClick={() => { setRespondingId(null); setResponseNote('') }}
                              className="px-4 py-2.5 rounded-xl border border-brand-200 text-brand-500 font-semibold text-sm hover:bg-brand-50">
                              Ajanona
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setRespondingId(inv.id)}
                          className="btn-primary text-sm">
                          💬 Hamaly
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: InvitationStatus }) {
  const config = {
    pending:  { cls: 'badge-pending', label: '⏳ Miandry' },
    accepted: { cls: 'badge-accepted', label: '✅ Noraisina' },
    refused:  { cls: 'badge-refused', label: '❌ Nandavana' },
  }
  const { cls, label } = config[status]
  return <span className={`text-xs font-bold px-3 py-1 rounded-full ${cls}`}>{label}</span>
}

function SampanaChip({ sampana, label }: { sampana: any; label: string }) {
  if (!sampana) return null
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
        style={{ background: sampana.color ?? '#7C3AED' }}>
        {sampana.name?.substring(0,2).toUpperCase()}
      </div>
      <div>
        <div className="text-xs text-brand-300 font-medium">{label}</div>
        <div className="font-semibold text-brand-800 text-sm leading-tight">{sampana.name}</div>
      </div>
    </div>
  )
}
