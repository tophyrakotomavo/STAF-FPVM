// app/dashboard/search/SearchClient.tsx
'use client'
import { useState, useMemo } from 'react'
import { Sampana, ProgrammeEvent, UserRole } from '@/lib/types'
import InviteModal from '@/components/InviteModal'

const MOIS_SHORT = ['Jan','Fév','Mar','Avr','May','Jôn','Jôl','Aog','Sep','Okt','Nov','Des']

interface Props {
  allSampana: Sampana[]
  allEvents: ProgrammeEvent[]
  mySampanaId: string | null
  role: UserRole
}

type Tab = 'date' | 'name'

export default function SearchClient({ allSampana, allEvents, mySampanaId, role }: Props) {
  const [tab, setTab] = useState<Tab>('date')
  const [searchDate, setSearchDate] = useState('')
  const [searchName, setSearchName] = useState('')
  const [nameDate, setNameDate] = useState('')
  const [excludeSelf, setExcludeSelf] = useState(true)
  const [inviteTarget, setInviteTarget] = useState<{ sampana: Sampana; date: string } | null>(null)

  // Check if a sampana is busy on a date
  const isBusy = (sampanaId: string, date: string) =>
    allEvents.some(e => e.sampana_id === sampanaId && e.event_date === date)

  const getEvent = (sampanaId: string, date: string) =>
    allEvents.find(e => e.sampana_id === sampanaId && e.event_date === date)

  // ── Date Search ─────────────────────────────────────────
  const dateResults = useMemo(() => {
    if (!searchDate) return []
    return allSampana
      .filter(s => !(excludeSelf && s.id === mySampanaId))
      .map(s => ({
        ...s,
        dispo: !isBusy(s.id, searchDate),
        event: getEvent(s.id, searchDate),
      }))
      .sort((a, b) => Number(b.dispo) - Number(a.dispo))
  }, [searchDate, excludeSelf, allSampana, allEvents])

  // ── Name Search ─────────────────────────────────────────
  const matchedSampana = useMemo(() => {
    if (!searchName.trim()) return []
    const q = searchName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    return allSampana.filter(s => {
      const n = s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      return n.includes(q)
    })
  }, [searchName, allSampana])

  const eventsByMonth = (sampanaId: string) => {
    const byM: Record<number, ProgrammeEvent[]> = {}
    allEvents.filter(e => e.sampana_id === sampanaId).forEach(e => {
      const m = new Date(e.event_date + 'T00:00:00').getMonth()
      if (!byM[m]) byM[m] = []
      byM[m].push(e)
    })
    return byM
  }

  const fmt = (d: string) => {
    const [,m,day] = d.split('-')
    return `${parseInt(day)} ${MOIS_SHORT[parseInt(m)-1]}`
  }

  const canInvite = role === 'leader' && mySampanaId

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-900 mb-1">🔎 Mitady Sampana</h1>
        <p className="text-brand-400 text-sm">Hanontany ny fandaharam-potoana sy ny fisian'ny sampana</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-brand-100 rounded-xl w-fit">
        {([['date','📅 Recherche amin\'ny daty'],['name','🏘️ Recherche amin\'ny anaran\'ny sampana']] as [Tab,string][]).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              tab === t ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-500 hover:text-brand-700'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── DATE SEARCH ── */}
      {tab === 'date' && (
        <div>
          <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm mb-5">
            <label className="block text-xs font-bold text-brand-400 mb-2 tracking-wider">FIDIO NY DATY HO ASAINA</label>
            <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)}
              min="2026-01-01" max="2026-12-31"
              className="input-base text-lg" />
            {mySampanaId && (
              <label className="flex items-center gap-2.5 mt-4 cursor-pointer select-none">
                <input type="checkbox" checked={excludeSelf} onChange={e => setExcludeSelf(e.target.checked)}
                  className="w-4 h-4 accent-brand-600 rounded" />
                <span className="text-sm font-medium text-brand-600">Tsy hasiana ny sampanako</span>
              </label>
            )}
          </div>

          {searchDate && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-brand-700 font-bold">{fmt(searchDate)} 2026</span>
                <span className="text-xs bg-brand-100 text-brand-600 rounded-full px-3 py-1 font-bold">
                  {dateResults.filter(r => r.dispo).length} sampana dispo
                </span>
              </div>

              {/* Available */}
              {dateResults.filter(r => r.dispo).length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-black text-emerald-700 tracking-widest mb-2">✅ MALALAKA — AFAKA ASAINA</div>
                  <div className="space-y-2">
                    {dateResults.filter(r => r.dispo).map(s => (
                      <ResultRow key={s.id} sampana={s} dispo={true}
                        onInvite={canInvite ? () => setInviteTarget({ sampana: s, date: searchDate }) : undefined} />
                    ))}
                  </div>
                </div>
              )}

              {/* Busy */}
              {dateResults.filter(r => !r.dispo).length > 0 && (
                <div>
                  <div className="text-xs font-black text-red-600 tracking-widest mb-2">❌ MISY PROGRAMA</div>
                  <div className="space-y-2">
                    {dateResults.filter(r => !r.dispo).map(s => (
                      <ResultRow key={s.id} sampana={s} dispo={false}
                        eventTitle={(s as any).event?.title} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!searchDate && (
            <div className="text-center py-16 text-brand-300">
              <div className="text-5xl mb-4">📆</div>
              <div className="font-semibold">Fidio daty iray mba hijery ny sampana malalaka</div>
            </div>
          )}
        </div>
      )}

      {/* ── NAME SEARCH ── */}
      {tab === 'name' && (
        <div>
          <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-400 mb-2 tracking-wider">ANARAN'NY SAMPANA</label>
                <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)}
                  placeholder="Ambohimanarina, Kanana..." className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-400 mb-2 tracking-wider">DATY (TENA RANA)</label>
                <input type="date" value={nameDate} onChange={e => setNameDate(e.target.value)}
                  min="2026-01-01" max="2026-12-31" className="input-base" />
              </div>
            </div>
          </div>

          {searchName && matchedSampana.length === 0 && (
            <div className="text-center py-12 text-brand-300">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-semibold">Tsy hita sampana mifanaraka amin'ny "{searchName}"</div>
            </div>
          )}

          {matchedSampana.map(sampana => {
            const busy = isBusy(sampana.id, nameDate)
            const ev = nameDate ? getEvent(sampana.id, nameDate) : null
            const byMonth = eventsByMonth(sampana.id)
            const totalEvents = allEvents.filter(e => e.sampana_id === sampana.id).length

            return (
              <div key={sampana.id} className="bg-white rounded-2xl border border-brand-100 shadow-sm mb-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 p-5 border-b border-brand-50"
                  style={{ background: sampana.color + '0d' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow"
                    style={{ background: `linear-gradient(135deg, ${sampana.color}dd, ${sampana.color}88)` }}>
                    {sampana.name.substring(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-brand-900 text-lg">{sampana.name}</div>
                    <div className="text-brand-400 text-xs">{sampana.church?.name} • {totalEvents} fotoana 2026</div>
                  </div>
                  {nameDate && (
                    <div className="text-right">
                      <div className="text-xs text-brand-400 mb-1">{fmt(nameDate)}</div>
                      <StatusBadge dispo={!busy} />
                      {ev?.title && <div className="text-xs text-brand-400 mt-1">📝 {ev.title}</div>}
                      {!busy && canInvite && sampana.id !== mySampanaId && (
                        <button onClick={() => setInviteTarget({ sampana, date: nameDate })}
                          className="mt-2 text-xs btn-primary py-1.5 px-3">
                          📨 Manasa
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Mini calendar */}
                <div className="p-5">
                  <div className="text-xs font-black text-brand-400 tracking-widest mb-3">FANDAHARAM-POTOANA 2026</div>
                  <div className="grid grid-cols-6 gap-2">
                    {MOIS_SHORT.map((m, idx) => {
                      const count = byMonth[idx]?.length ?? 0
                      return (
                        <div key={idx} className={`p-2 rounded-lg text-center border ${count > 0 ? 'border-brand-200 bg-brand-50' : 'border-gray-100'}`}>
                          <div className={`text-xs font-bold ${count > 0 ? 'text-brand-500' : 'text-gray-300'}`}>{m}</div>
                          <div className={`text-sm font-bold mt-0.5 ${count > 0 ? 'text-brand-700' : 'text-gray-200'}`}>
                            {count > 0 ? count : '·'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          {!searchName && (
            <div className="text-center py-16 text-brand-300">
              <div className="text-5xl mb-4">🏘️</div>
              <div className="font-semibold">Soratao ny anaran'ny sampana hitadiavana</div>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {inviteTarget && mySampanaId && (
        <InviteModal
          inviterSampanaId={mySampanaId}
          targetSampana={inviteTarget.sampana}
          date={inviteTarget.date}
          onClose={() => setInviteTarget(null)}
        />
      )}
    </div>
  )
}

function ResultRow({ sampana, dispo, eventTitle, onInvite }: {
  sampana: Sampana; dispo: boolean; eventTitle?: string; onInvite?: () => void
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${
      dispo ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
    }`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow"
        style={{ background: `linear-gradient(135deg, ${sampana.color}dd, ${sampana.color}88)` }}>
        {sampana.name.substring(0,2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-brand-800 text-sm">{sampana.name}</div>
        {!dispo && eventTitle && <div className="text-xs text-brand-400">📝 {eventTitle}</div>}
        <div className="text-xs text-brand-300">{sampana.church?.name}</div>
      </div>
      <StatusBadge dispo={dispo} />
      {dispo && onInvite && (
        <button onClick={onInvite} className="btn-primary text-xs py-1.5 px-3 ml-2">📨 Manasa</button>
      )}
    </div>
  )
}

function StatusBadge({ dispo }: { dispo: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
      dispo ? 'badge-accepted' : 'badge-refused'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dispo ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {dispo ? 'DISPO' : 'MISY PROGRAMA'}
    </span>
  )
}
